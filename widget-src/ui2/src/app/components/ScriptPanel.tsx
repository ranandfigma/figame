import * as React from 'react';
import {ScriptOption} from './ScriptOption';
import Select from 'react-select';
import CodeEditor from '@uiw/react-textarea-code-editor';
import {ScriptView} from './ScriptView';

export interface ScriptBlock {
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
    const [fieldValue, setFieldValue] = React.useState<string>('');
    const [canCollide, setCanCollide] = React.useState<boolean>();

    const options = [
        <ScriptOption displayName="Move Vertical" displayColor="#ccc" functionName="move-vertical" />,
        <ScriptOption displayName="Move Horizontal" displayColor="#ccc" functionName="move-horizontal" />,
        <ScriptOption displayName="Custom Javascript" displayColor="#ccc" functionName="custom" />,
        <ScriptOption displayName="Debug" displayColor="#ccc" functionName="debug" />,
    ];

    const triggerOptions = [
        {value: 'Every Frame', label: 'frame-update'},
        {value: 'On Collision', label: 'on-collision'},
        {value: 'On Key Press', label: 'key-down'},
        {value: 'Game Start', label: 'game-start'},
    ];

    const keyCodeOptions = [
        {value: 'Up Arrow', label: 'ArrowUp'},
        {value: 'Down Arrow', label: 'ArrowDown'},
        {value: 'Left Arrow', label: 'ArrowLeft'},
        {value: 'Right Arrow', label: 'ArrowRight'},
        {value: 'W', label: 'w'},
        {value: 'A', label: 'a'},
        {value: 'S', label: 's'},
        {value: 'D', label: 'd'},
    ];

    const resetOption = () => {
        setActiveOption('');
        setFieldValue('');
    };

    return (
        <div>
            <div style={{display: 'flex'}}>
                <div style={{width: '30%'}}>
                    <div style={{border: '1px solid #666', borderRadius: '6px', padding: '4px'}}>
                        Node Properties:
                        <div style={{marginTop: '4px'}}>
                            Can Collide
                            <input type="checkbox" onChange={(e) => setCanCollide(e.target.checked)} />
                        </div>
                        <div
                            style={{
                                margin: '4px',
                                cursor: 'pointer',
                                border: '1px solid black',
                                borderRadius: '6px',
                                padding: '4px',
                            }}
                            onClick={() => {
                                parent.postMessage({pluginMessage: {type: 'nodeUpdate', canCollide}}, '*');
                            }}
                        >
                            SET NODE PROPERTIES
                        </div>
                    </div>
                    <div style={{marginTop: '8px'}}>
                        Script Trigger:
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
                    <div style={{marginTop: '8px'}}>
                        Script Blocks:
                        {options.map((option) => {
                            return (
                                <div
                                    style={{margin: '4px', cursor: 'pointer'}}
                                    onClick={() => {
                                        setFieldValue('');
                                        setActiveOption(option.props.functionName);
                                    }}
                                >
                                    {option}
                                </div>
                            );
                        })}
                    </div>
                    <div>
                        {activeOption}
                        <div>
                            {(activeOption === 'move-vertical' || activeOption === 'move-horizontal') && (
                                <div>
                                    Set Delta:{' '}
                                    <input
                                        defaultValue={'0'}
                                        type="text"
                                        onChange={(e) => {
                                            setFieldValue(e.target.value);
                                        }}
                                    />
                                </div>
                            )}
                            {activeOption === 'custom' && (
                                <div>
                                    Custom JS:{' '}
                                    <CodeEditor
                                        value={fieldValue}
                                        language="js"
                                        placeholder="Please enter a JS function like `(nodeId, context) => {}`"
                                        padding={15}
                                        minHeight={150}
                                        style={{
                                            fontSize: 12,
                                            backgroundColor: '#f5f5f5',
                                            fontFamily:
                                                'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
                                        }}
                                        onChange={(e) => {
                                            setFieldValue(e.target.value);
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                        <div
                            style={{
                                margin: '4px',
                                cursor: 'pointer',
                                border: '1px solid black',
                                borderRadius: '6px',
                                padding: '4px',
                            }}
                            onClick={() => {
                                const args = {};
                                if (activeOption === 'custom') {
                                    args['js'] = fieldValue;
                                } else if (activeOption === 'move-horizontal' || activeOption === 'move-vertical') {
                                    args['delta'] = fieldValue;
                                }

                                setScriptBlocks([...scriptBlocks, {functionName: activeOption, args}]);
                                resetOption();
                            }}
                        >
                            ADD SCRIPT BLOCK
                        </div>
                    </div>
                </div>
                <div style={{width: '70%'}}>
                    <ScriptView scriptBlocks={scriptBlocks} />
                </div>
            </div>
            <div style={{display: 'flex', marginTop: '16px'}}>
                <div
                    style={{
                        margin: '4px',
                        cursor: 'pointer',
                        border: '1px solid black',
                        borderRadius: '6px',
                        padding: '4px',
                    }}
                    onClick={() => {
                        resetOption();
                        setScriptBlocks([]);
                    }}
                >
                    RESET SCRIPTBUILDER
                </div>
                <div
                    style={{
                        margin: '4px',
                        cursor: 'pointer',
                        border: '1px solid black',
                        borderRadius: '6px',
                        padding: '4px',
                    }}
                    onClick={() => {
                        parent.postMessage(
                            {
                                pluginMessage: {
                                    type: 'scriptAssign',
                                    scriptBlocks: JSON.stringify(scriptBlocks),
                                    triggerEventType: trigger,
                                    keyCode: trigger === 'key-down' ? keyCode : undefined,
                                },
                            },
                            '*'
                        );

                        resetOption();
                        setScriptBlocks([]);
                    }}
                >
                    ADD SCRIPT TO SELECTED NODE
                </div>
                <div
                    style={{
                        margin: '4px',
                        cursor: 'pointer',
                        border: '1px solid black',
                        borderRadius: '6px',
                        padding: '4px',
                    }}
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
