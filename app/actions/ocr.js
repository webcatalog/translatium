/* global fetch FormData URL document Image Windows MSApp */
import { push } from 'react-router-redux';
import Immutable from 'immutable';

import { UPDATE_OCR } from '../constants/actions';

import translateArray from '../libs/translateArray';
import openFileToBlob from '../libs/openFileToBlob';
import captureToBlob from '../libs/captureToBlob';
import { toOcrSpaceLanguage } from '../libs/languageUtils';
import { openAlert } from './alert';

export const loadImage = fromCamera => (dispatch, getState) => {
  const { inputLang, outputLang } = getState().settings;

  Promise.resolve()
    .then(() => {
      if (fromCamera === true) return captureToBlob();
      return openFileToBlob();
    })
    .then((result) => {
      if (!result) return null;

      dispatch({
        type: UPDATE_OCR,
        ocr: Immutable.fromJS({ status: 'loading' }),
      });

      // compress
      return new Promise((resolve, reject) => {
        const imageObj = new Image();
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        imageObj.onload = function onLoad() {
          const maxSize = 2600;
          const ratio = maxSize / Math.max(this.width, this.height);
          const maxWidth = Math.round(this.width * ratio);
          const maxHeight = Math.round(this.height * ratio);

          canvas.width = maxWidth;
          canvas.height = maxHeight;
          context.clearRect(0, 0, maxWidth, maxHeight);
          context.drawImage(imageObj, 0, 0, this.width, this.height, 0, 0, maxWidth, maxHeight);

          switch (process.env.PLATFORM) {
            case 'windows': {
              const inMemoryRandomAccessStream =
                new Windows.Storage.Streams.InMemoryRandomAccessStream();
              Windows.Graphics.Imaging.BitmapEncoder.createAsync(
                Windows.Graphics.Imaging.BitmapEncoder.jpegEncoderId,
                inMemoryRandomAccessStream,
              )
              .then((encoder) => {
                // Set the pixel data in the encoder
                encoder.setPixelData(
                  Windows.Graphics.Imaging.BitmapPixelFormat.rgba8,
                  Windows.Graphics.Imaging.BitmapAlphaMode.straight,
                  canvas.width,
                  canvas.height,
                  96,
                  96,
                  new Uint8Array(
                    context.getImageData(0, 0, canvas.width, canvas.height).data,
                  ));

                // Go do the encoding
                return encoder.flushAsync();
              })
              .then(() => {
                const blob = MSApp.createBlobFromRandomAccessStream(
                  'image/jpeg', inMemoryRandomAccessStream,
                );
                resolve({
                  blob,
                  fileName: result.fileName,
                });
              })
              .then(null, err => reject(err));
              break;
            }
            default: {
              canvas.toBlob((blob) => {
                resolve({
                  blob,
                  fileName: result.fileName,
                });
              }, 'image/jpeg', 50);
            }
          }
        };

        imageObj.src = URL.createObjectURL(result.blob, { oneTimeOnly: true });
      });
    })
    .then((result) => {
      if (!result) return;

      const { blob, fileName } = result;

      console.log(blob);

      const formData = new FormData();
      formData.append('apikey', '0088228ab088957');
      formData.append('file', blob, fileName);
      formData.append('language', toOcrSpaceLanguage(inputLang));
      formData.append('isOverlayRequired', true);

      fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        body: formData,
      })
      .then(response => response.json())
      .then((t) => {
        console.log(t);

        const { ParsedResults } = t;

        if (ParsedResults[0].FileParseExitCode !== 1) {
          dispatch({
            type: UPDATE_OCR,
            ocr: null,
          });

          dispatch(openAlert('cannotRecognizeImage'));

          return null;
        }

        const inputText = ParsedResults[0].ParsedText;
        const inputLines = ParsedResults[0].TextOverlay.Lines.map((line) => {
          let lineText = '';

          line.Words.forEach((word) => { lineText += ` ${word.WordText}`; });

          return {
            height: line.MaxHeight,
            top: line.MinTop,
            left: line.Words[0].Left,
            text: lineText,
          };
        });

        const inputArr = inputLines.map(line => line.text);

        return translateArray(inputLang, outputLang, inputArr)
          .then(({ outputArr, outputText }) => {
            const outputLines = outputArr.map((text, i) => ({
              height: inputLines[i].height,
              top: inputLines[i].top,
              left: inputLines[i].left,
              text,
            }));

            dispatch({
              type: UPDATE_OCR,
              ocr: Immutable.fromJS({
                status: 'done',
                imageUrl: URL.createObjectURL(blob, { oneTimeOnly: true }),
                inputText,
                inputLines,
                outputText,
                outputLines,
              }),
            });


            dispatch(push('/ocr'));
          });
      })
      .catch((err) => {
        console.log(err);

        dispatch({
          type: UPDATE_OCR,
          ocr: null,
        });

        dispatch(openAlert('cannotConnectToServer'));
      });
    })
    .catch(() => {
      dispatch(openAlert('cannotOpenTheFile'));
    });
};

export const setZoomLevel = zoomLevel => (dispatch, getState) => {
  const ocr = getState().ocr;
  dispatch({
    type: UPDATE_OCR,
    ocr: ocr.set('zoomLevel', zoomLevel),
  });
};

export const setMode = mode => (dispatch, getState) => {
  const ocr = getState().ocr;
  dispatch({
    type: UPDATE_OCR,
    ocr: ocr.set('mode', mode),
  });
};
