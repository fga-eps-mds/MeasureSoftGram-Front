import { TreeItem, TreeView } from '@mui/lab';
import { Checkbox } from '@mui/material';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';
import { useProductCurrentPreConfig } from '@hooks/useProductCurrentPreConfig';
import _ from 'lodash';
import { Characteristic } from '@customTypes/preConfig';

interface Nodes {
  id: string;
  name: string;
  parent?: string;
  children?: Nodes[];
}

function bfsSearch(
  graph: {
    id: string;
    name: string;
    children: { id: string; name: string; parent: string; children: { id: string; name: string; parent: string }[] }[];
  }[],
  targetId: string
) {
  const queue = [...graph];

  while (queue.length > 0) {
    const currNode = queue.shift();
    if (currNode.id === targetId) {
      return currNode;
    }
    if (currNode.children) {
      queue.push(...currNode.children);
    }
  }
  return [];
}

function formatData(rawData: Characteristic[]) {
  return _.map(rawData, (characteristic) => ({
    id: characteristic.key,
    name: characteristic.key,
    children: _.map(characteristic.subcharacteristics, (subcharacteristic) => ({
      id: subcharacteristic.key,
      name: subcharacteristic.key,
      parent: characteristic.key,
      children: _.map(subcharacteristic.measures, (measure) => ({
        id: measure.key,
        name: measure.key,
        parent: subcharacteristic.key
      }))
    }))
  }));
}

export default function TreeViewFilter() {
  const [selectedNodes, setSelectedNodes] = useState([]);
  const { data: rawData } = useProductCurrentPreConfig();

  const data = useMemo(() => formatData(rawData), [rawData]);

  useEffect(() => {
    console.log('Selected Nodes:');
    console.log(JSON.stringify(selectedNodes, null, 4));
  }, [selectedNodes]);

  function getAllIds(node: { id: any; children: any[] }, idList = []) {
    idList.push(node.id);
    if (node.children) {
      node.children.forEach((child: any) => getAllIds(child, idList));
    }
    return idList;
  }

  const getAllChild = (id: string) => getAllIds(bfsSearch(data, id));

  const getAllFathers = (id: string, list = []) => {
    const node = bfsSearch(data, id);
    if (node.parent) {
      list.push(node.parent);

      return getAllFathers(node.parent, list);
    }

    return list;
  };

  function isAllChildrenChecked(node: { id: string }, list: ConcatArray<never>) {
    const allChild = getAllChild(node.id);
    const nodeIdIndex = allChild.indexOf(node.id);
    allChild.splice(nodeIdIndex, 1);

    return allChild.every((nodeId) => selectedNodes.concat(list).includes(nodeId));
  }

  const handleNodeSelect = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, nodeId: string) => {
    event.stopPropagation();
    const allChild = getAllChild(nodeId);
    const fathers = getAllFathers(nodeId);

    if (selectedNodes.includes(nodeId)) {
      setSelectedNodes((prevSelectedNodes) => prevSelectedNodes.filter((id) => !allChild.concat(fathers).includes(id)));
    } else {
      const ToBeChecked = allChild;
      for (let i = 0; i < fathers.length; ++i) {
        if (isAllChildrenChecked(bfsSearch(data, fathers[i]), ToBeChecked)) {
          ToBeChecked.push(fathers[i]);
        }
      }
      setSelectedNodes((prevSelectedNodes) => [...prevSelectedNodes].concat(ToBeChecked));
    }
  };

  const renderTree = (nodes: Nodes) => (
    <TreeItem
      key={nodes.id}
      nodeId={nodes.id}
      label={
        <>
          <Checkbox
            checked={selectedNodes.indexOf(nodes.id) !== -1}
            tabIndex={-1}
            disableRipple
            onClick={(event) => handleNodeSelect(event, nodes.id)}
          />
          {nodes.name}
        </>
      }
    >
      {Array.isArray(nodes.children) ? nodes.children.map((node) => renderTree(node)) : null}
    </TreeItem>
  );

  return (
    <TreeView
      multiSelect
      defaultCollapseIcon={<KeyboardArrowDownRoundedIcon />}
      defaultExpandIcon={<KeyboardArrowRightRoundedIcon />}
      selected={selectedNodes}
    >
      {data.map((node) => renderTree(node))}
    </TreeView>
  );
}
