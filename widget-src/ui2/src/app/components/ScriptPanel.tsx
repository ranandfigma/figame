import * as React from 'react';
import {ScriptOption} from './ScriptOption';
import Select from 'react-select';

interface ScriptBlock {
    functionName: string;
    args: any;
}

// const setParametersBasedOnScriptFunction = (functionName: string) => {
//     switch (functionName) {
//         case 'move-vertical':

//     }
// }

export const ScriptPanel = () => {
    const [scriptBlocks, setScriptBlocks] = React.useState<ScriptBlock[]>([]);
    const [activeOption, setActiveOption] = React.useState<string>('');
    const [trigger, setTrigger] = React.useState<string>('frame-update');
    const [keyCode, setKeyCode] = React.useState<string>('ArrowUp');

    const options = [
        <ScriptOption displayName="Move Vertical" displayColor="#ccc" functionName="move-vertical" />,
        <ScriptOption displayName="Move Horizontal" displayColor="#ccc" functionName="move-horizontal" />,
        <ScriptOption displayName="Move Debug" displayColor="#ccc" functionName="debug" />,
    ];

    const triggerOptions = [
        {value: 'Every Frame', label: 'frame-update'},
        {value: 'On Collision', label: 'on-collision'},
        {value: 'On Key Press', label: 'key-down'},
    ];

    const keyCodeOptions = [
        {value: 'Up Arrow', label: 'ArrowUp'},
        {value: 'Down Arrow', label: 'ArrowDown'},
        {value: 'Left Arrow', label: 'ArrowLeft'},
        {value: 'Right Arrow', label: 'ArrowRight'},
    ];

    return (
        <div>
            {options.map((option) => {
                return (
                    <div
                        style={{margin: '4px', cursor: 'pointer'}}
                        onClick={() => {
                            setActiveOption(option.props.functionName);
                            setScriptBlocks([
                                ...scriptBlocks,
                                {functionName: option.props.functionName, args: {delta: 5}},
                            ]);
                        }}
                    >
                        {option}
                    </div>
                );
            })}
            <div>
                {activeOption}
                <div>
                    Trigger:
                    <Select
                        defaultValue={triggerOptions[0]}
                        onChange={(option) => {
                            console.log({option});
                            setTrigger(option.label);
                            if (option.label !== 'key-down') {
                                setKeyCode('');
                            }
                        }}
                        options={triggerOptions}
                    />
                </div>
                {trigger === 'key-down' && (
                    <div>
                        <Select
                            defaultValue={keyCodeOptions[0]}
                            options={keyCodeOptions}
                            onChange={(option) => {
                                setKeyCode(option.label);
                            }}
                        />
                    </div>
                )}
            </div>
            <div style={{margin: '4px', padding: '4px', border: '1px solid black'}}>
                Script Blocks:
                {scriptBlocks.map((scriptBlock) => {
                    return <div>{scriptBlock.functionName}</div>;
                })}
            </div>
            <div style={{display: 'flex'}}>
                <div
                    style={{margin: '4px', cursor: 'pointer', border: '1px solid black', padding: '4px'}}
                    onClick={() => {
                        setActiveOption('');
                        setScriptBlocks([]);
                    }}
                >
                    RESET SCRIPTBUILDER
                </div>
                <div
                    style={{margin: '4px', cursor: 'pointer', border: '1px solid black', padding: '4px'}}
                    onClick={() => {
                        console.log('posting message');
                        console.log({
                            type: 'scriptAssign',
                            scriptBlocks: JSON.stringify(scriptBlocks),
                            triggerEventType: trigger,
                            keyCode: keyCode !== '' ? keyCode : undefined,
                        });
                        parent.postMessage(
                            {
                                pluginMessage: {
                                    type: 'scriptAssign',
                                    scriptBlocks: JSON.stringify(scriptBlocks),
                                    triggerEventType: trigger,
                                    keyCode: keyCode !== '' ? keyCode : undefined,
                                },
                            },
                            '*'
                        );
                    }}
                >
                    ADD SCRIPT TO SELECTED NODE
                </div>
                <div
                    style={{margin: '4px', cursor: 'pointer', border: '1px solid black', padding: '4px'}}
                    onClick={() => {
                        parent.postMessage({pluginMessage: {type: 'scriptRemove'}}, '*');
                    }}
                >
                    REMOVE ALL SCRIPTS FROM SELECTED NODE
                </div>
            </div>
        </div>
    );
};
