import { TreeItem, TreeView } from '@mui/lab';
import { Box, Checkbox, Typography } from '@mui/material';
import React, { useState, useEffect, useMemo } from 'react';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';
import { useProductCurrentPreConfig } from '@hooks/useProductCurrentPreConfig';
import _ from 'lodash';
import { Characteristic } from '@customTypes/preConfig';
import { useProductConfigFilterContext } from '@contexts/ProductConfigFilterProvider/ProductConfigFilterProvider';
import SearchButton from '@components/SearchButton/SearchButton';

interface Node {
  id: string;
  name: string;
  description?: string;
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
  return [
    {
      id: 'root',
      name: 'root',
      children: _.map(rawData, (characteristic) => ({
        id: characteristic.key,
        name: _.capitalize(characteristic.key.replace(/_/g, ' ')),
        description: 'Característica',
        parent: 'root',
        children: _.map(characteristic.subcharacteristics, (subcharacteristic) => ({
          id: subcharacteristic.key,
          name: _.capitalize(subcharacteristic.key.replace(/_/g, ' ')),
          description: 'Sub-Característica',
          parent: characteristic.key,
          children: _.map(subcharacteristic.measures, (measure) => ({
            id: measure.key,
            name: _.capitalize(measure.key.replace(/_/g, ' ')),
            description: 'Medida',
            parent: subcharacteristic.key,
            children: _.map(measure.metrics, (metric) => ({
              id: metric.key,
              name: _.capitalize(measure.key.replace(/_/g, ' ')),
              description: 'Métrica',
              parent: measure.key
            }))
          }))
        }))
      }))
    }
  ];
}

export default function TreeViewFilter() {
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<string[]>([]);
  const { data: rawData } = useProductCurrentPreConfig();
  const { setConfigFilter } = useProductConfigFilterContext();

  const data = useMemo(() => formatData(rawData ?? []), [rawData]);

  useMemo(() => {
    if (data.length > 0) {
      setSelectedNodes(getAllIds(data[0]));
      setExpandedNodes(getAllIds(data[0]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

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

  function handleSearch(search: string) {
    // TODO: Implementar busca
  }

  const renderTree = (nodes: Node) => (
    <TreeItem
      key={nodes.id}
      nodeId={nodes.id}
      label={
        <Box display="flex" flexDirection="row" alignItems="center">
          <Checkbox
            checked={_.indexOf(selectedNodes, nodes.id) !== -1}
            tabIndex={-1}
            disableRipple
            onClick={(event) => handleNodeSelect(event, nodes.id)}
          />
          <Box display="flex" flexDirection="column">
            <Typography variant="body1">{nodes.name}</Typography>
            <Typography variant="caption" color="gray" mt="-6px">
              {nodes.description}
            </Typography>
          </Box>
        </Box>
      }
    >
      {Array.isArray(nodes.children) ? nodes.children.map((node) => renderTree(node)) : null}
    </TreeItem>
  );

  return (
    <Box>
      <SearchButton onInput={(e) => handleSearch(e.target.value)} label="Pesquisar" />
      <TreeView
        defaultExpanded={expandedNodes}
        defaultCollapseIcon={<KeyboardArrowDownRoundedIcon />}
        defaultExpandIcon={<KeyboardArrowRightRoundedIcon />}
      >
        {data[0].children.map((node) => renderTree(node))}
      </TreeView>
    </Box>
  );
}
