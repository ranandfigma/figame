import * as React from 'react';
import '../styles/ui.css';
import {ScriptPanel} from './ScriptPanel';
import {PlayPanel} from './PlayPanel';

declare function require(path: string): any;

const App = ({}) => {
    const [view, setView] = React.useState<'script' | 'play'>('script');
    const [gameLoopId, setGameLoopId] = React.useState<number>();
    const [nodeSelectListenerId, setNodeSelectListenerId] = React.useState<number>();
    const [selectedNodeScripts, setSelectedNodeScripts] = React.useState<string[] | undefined>([]);

    React.useMemo(() => {
        let keyCodeDown: string | undefined;

        const nodeSelectListener = setInterval(() => {
            parent.postMessage({pluginMessage: {type: 'get-node'}}, '*');
        }, 100);
        setNodeSelectListenerId(nodeSelectListener);

        addEventListener('message', (event) => {
            if (event.data.pluginMessage.type === 'node-info') {
                if (event.data.pluginMessage.isNodeSelected === false) {
                    setSelectedNodeScripts(undefined);
                } else if (!event.data.pluginMessage.scripts) {
                    setSelectedNodeScripts([]);
                } else {
                    setSelectedNodeScripts(event.data.pluginMessage.scripts.map((script: any) => script.name) || []);
                }
            }

            if (event.data.pluginMessage.type === 'script') {
                setView('script');
                document.onkeydown = () => {};
                document.onkeyup = () => {};
                clearInterval(gameLoopId);
                setGameLoopId(undefined);

                const nodeSelectListener2 = setInterval(() => {
                    parent.postMessage({pluginMessage: {type: 'get-node'}}, '*');
                }, 100);
                setNodeSelectListenerId(nodeSelectListener2);
            }
            if (event.data.pluginMessage.type === 'stop') {
                setView('script');
                document.onkeydown = () => {};
                document.onkeyup = () => {};
                clearInterval(gameLoopId);
                setGameLoopId(undefined);
            }
            if (event.data.pluginMessage.type === 'play') {
                setView('play');

                clearInterval(nodeSelectListenerId);
                setNodeSelectListenerId(undefined);

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

                const gameLoop = setInterval(() => {
                    const message = {pluginMessage: {type: 'tick'}};
                    parent.postMessage(message, '*');

                    if (keyCodeDown) {
                        parent.postMessage({pluginMessage: {type: 'keydown', keyCode: keyCodeDown}}, '*');
                    }
                }, 1000 / 30);
                setGameLoopId(gameLoop);
            }
        });
    }, []);

    return (
        <div>
            {view === 'script' && <ScriptPanel selectedNodeScripts={selectedNodeScripts} />}
            {view === 'play' && <PlayPanel />}
        </div>
    );
};

export default App;
