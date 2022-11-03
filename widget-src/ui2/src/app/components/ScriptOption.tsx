import * as React from 'react';

interface ScriptOptionProps {
    displayName: string;
    displayColor: string;

    functionName: string;
}

export const ScriptOption = (props: ScriptOptionProps) => {
    const {displayName, displayColor, functionName} = props;

    return (
        <div
            style={{width: '200px', height: '50px', backgroundColor: displayColor}}
            onClick={() => {
                console.log('setting', functionName);
            }}
        >
            {displayName}
        </div>
    );
};
