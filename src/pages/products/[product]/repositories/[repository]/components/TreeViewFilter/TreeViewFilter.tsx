import { TreeItem, TreeView } from '@mui/lab';
import { Checkbox } from '@mui/material';
import React, { useState, useEffect, useMemo } from 'react';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';
import { useProductCurrentPreConfig } from '@hooks/useProductCurrentPreConfig';
import _ from 'lodash';
import { Characteristic } from '@customTypes/preConfig';
import { useProductConfigFilterContext } from '@contexts/ProductConfigFilterProvider/ProductConfigFilterProvider';

interface Node {
  id: string;
  name: string;
  parent?: string;
  children?: Node[];
}

function bfsSearch(graph: Node[], targetId: string) {
  const queue = [...graph];

  while (queue.length > 0) {
    const currNode = queue.shift();
    if (currNode?.id === targetId) {
      return currNode;
    }
    if (currNode?.children) {
      queue.push(...currNode.children);
    }
  }
  return undefined;
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
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const { data: rawData } = useProductCurrentPreConfig();
  const { setConfigFilter } = useProductConfigFilterContext();

  const data = useMemo(() => formatData(rawData ?? []), [rawData]);

  useEffect(() => {
    setConfigFilter(selectedNodes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNodes]);

  function getAllIds(node: Node, idList: string[] = []) {
    idList.push(node.id);
    if (node.children) {
      node.children.forEach((child: any) => getAllIds(child, idList));
    }
    return idList;
  }

  function getAllChild(id: string) {
    const node = bfsSearch(data, id);
    return node ? getAllIds(node) : [];
  }

  function getAllFathers(id: string, list: string[] = []) {
    const node = bfsSearch(data, id);
    if (node?.parent) {
      list.push(node.parent);
      return getAllFathers(node.parent, list);
    }
    return list;
  }

  function isAllChildrenChecked(node: Node | undefined, list: ConcatArray<string>) {
    if (!node) return [];
    const allChild = getAllChild(node.id);
    const nodeIdIndex = allChild.indexOf(node.id);
    allChild.splice(nodeIdIndex, 1);
    return _.every(allChild, (nodeId) => selectedNodes.concat(list).includes(nodeId));
  }

  function handleNodeSelect(event: React.MouseEvent<HTMLButtonElement, MouseEvent>, nodeId: string) {
    event.stopPropagation();
    const allChild = getAllChild(nodeId);
    const fathers = getAllFathers(nodeId);

    if (selectedNodes.includes(nodeId)) {
      setSelectedNodes((prevSelectedNodes) => prevSelectedNodes.filter((id) => !allChild.concat(fathers).includes(id)));
    } else {
      const ToBeChecked = allChild;
      for (let i = 0; i < fathers.length; i += 1) {
        if (isAllChildrenChecked(bfsSearch(data, fathers[i]), ToBeChecked)) {
          ToBeChecked.push(fathers[i]);
        }
      }
      setSelectedNodes((prevSelectedNodes) => [...prevSelectedNodes].concat(ToBeChecked));
    }
  }

  const renderTree = (nodes: Node) => (
    <TreeItem
      key={nodes.id}
      nodeId={nodes.id}
      label={
        <>
          <Checkbox
            checked={_.indexOf(selectedNodes, nodes.id) !== -1}
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
