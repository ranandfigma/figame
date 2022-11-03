import * as React from 'react';
import ReactFlow from 'react-flow-renderer';
import {ScriptBlock} from './ScriptPanel';

export const ScriptView = ({scriptBlocks}: {scriptBlocks: ScriptBlock[]}) => {
    const nodes = [];
    for (let i = 0; i < scriptBlocks.length; i++) {
        nodes.push({
            id: `node-${i}`,
            type: i === 0 ? 'input' : 'default',
            data: {
                label: scriptBlocks[i].functionName,
            },
            position: {
                x: 150,
                y: 50 * i,
            },
            connectable: false,
            deletable: false,
        });
    }

    const edges = [];
    for (let i = 1; i < nodes.length; i++) {
        edges.push({
            id: `edge-${i}`,
            source: `node-${i - 1}`,
            target: `node-${i}`,
            animated: false,
        });
    }

    return <ReactFlow defaultNodes={nodes} defaultEdges={edges} />;
};
