import * as React from 'react';
import '../styles/ui.css';
import {ScriptPanel} from './ScriptPanel';

declare function require(path: string): any;

const App = ({}) => {
    React.useMemo(() => {
        console.log('eyo');

        let keyCodeDown: string | undefined;

        addEventListener('message', (event) => {
            if (event.data.pluginMessage.type === 'play') {
                document.onkeydown = (e: KeyboardEvent) => {
                    keyCodeDown = e.key;
                };

                document.onkeyup = () => {
                    keyCodeDown = undefined;
                };

                parent.postMessage({pluginMessage: {type: 'gameInit'}}, '*');

                // TODO: send all keyup/ keydown events to the main thread to handle.
                // TODO: Use the widget state to define and render controls.
                // TODO: move the camera to the center of the "camera frame" on start.

                setInterval(() => {
                    const message = {pluginMessage: {type: 'tick'}};
                    parent.postMessage(message, '*');

                    if (keyCodeDown) {
                        parent.postMessage({pluginMessage: {type: 'keydown', keyCode: keyCodeDown}}, '*');
                    }
                }, 1000 / 30);
            }
        });
    }, []);

    return (
        <div>
            <ScriptPanel />
        </div>
    );
};

export default App;
