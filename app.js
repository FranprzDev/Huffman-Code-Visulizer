const PARENT = "-";

let encode = {};
let decode = {};

function getFrequencies(text) {
  let freq = {};

  for (let i = 0; i < text.length; i++) {
    if (freq[text[i]]) {
      freq[text[i]].frequency++;
    } else {
      freq[text[i]] = {};
      freq[text[i]].symbol = text[i];
      freq[text[i]].frequency = 1;
    }
  }

  return freq;
}

function constructPriorityQueue(nodes) {
  let PriorityQueue = [];
  for (let node in nodes) {
    PriorityQueue.push(nodes[node]);
  }
  return PriorityQueue;
}

function getTop(queue) {
  let min = 999999;
  let index = -1;
  for (let i = 0; i < queue.length; i++) {
    if (queue[i].frequency < min) {
      min = queue[i].frequency;
      index = i;
    }
  }
  return index;
}

function constructHuffman(PriorityQueue) {
  while (PriorityQueue.length > 1) {
    let NewParetnNode = {},
      node1 = {},
      node2 = {};

    let node1Indx = getTop(PriorityQueue);
    node1 = PriorityQueue[node1Indx];
    PriorityQueue.splice(node1Indx, 1);
    let node2Indx = getTop(PriorityQueue);
    node2 = PriorityQueue[node2Indx];
    PriorityQueue.splice(node2Indx, 1);
    NewParetnNode.frequency = node1.frequency + node2.frequency;
    NewParetnNode.symbol = PARENT;
    NewParetnNode.left = node1;
    NewParetnNode.right = node2;
    PriorityQueue.push(NewParetnNode);
  }

  return PriorityQueue[0];
}
function getCode(root, code) {
  if (!root) return;
  if (root.symbol != PARENT) {
    encode[root.symbol] = code;
    decode[code] = root.symbol;
    return;
  }

  getCode(root.left, code + "0");
  getCode(root.right, code + "1");
}

function visualizeHuffman(root) {
  let level = 0;
  let q = [];
  q.push({ level: level, node: root });
  let map = {};
  let lvl = 0;
  while (q.length != 0) {
    let node = q.shift();
    if (!map[node.level]) map[node.level] = [];
    map[node.level].push(node.node.symbol);
    if (node.node.left) q.push({ level: node.level + 1, node: node.node.left });
    if (node.node.right)
      q.push({ level: node.level + 1, node: node.node.right });
    lvl = node.level;
  }

  let nodes = [];

  let edges = [];
  let indx = 0;
  let ids = new Array(1000).fill(0).map(() => new Array(1000).fill(0));
  for (let i = 0; i <= lvl; i++) {
    if (map[i]) {
      let s = "";
      let cnt = 0;
      let par = 0;
      for (let j = 0; j < map[i].length; j++) {
        s += map[i][j];
        let id = map[i][j];
        if (id == " ") id = "/s";
        if (map[i][j] == PARENT) {
          id = map[i][j] + indx;
          indx++;
        }
        ids[i][j] = id;

        nodes.push({ data: { id: id, symbol: map[i][j] } });
      }
    }
  }
  for (let i = 0; i <= lvl; i++) {
    if (map[i]) {
      let s = "";
      let cnt = 0;
      let par = 0;
      for (let j = 0; j < map[i].length; j++) {
        s += map[i][j];
        if (i != 0) {
          if (cnt == 2) {
            cnt = 0;
            par++;
          }
          if (map[i - 1][par] != PARENT) {
            par++;
            j--;
            continue;
          }
          cnt++;
          let parent = ids[i - 1][par];
          let child = ids[i][j];

          let label = cnt == 1 ? "1" : "0";

          edges.push({ data: { source: parent, target: child, label: label } });
          if (cnt == 2) {
            let lastIndex = edges.length - 1;
            if (
              edges[lastIndex].data.target < edges[lastIndex - 1].data.target
            ) {
              edges[lastIndex].data.label = "1";
              edges[lastIndex - 1].data.label = "0";
            } else {
              edges[lastIndex].data.label = "0";
              edges[lastIndex - 1].data.label = "1";
            }
          }
        }
      }
    }
  }
  return { nodes, edges };
}

function populateEncoderTable(frequencies, encode) {
  const tableBody = document.querySelector("#enconde");
  tableBody.innerHTML = "";

  const totalChars = Object.values(frequencies).reduce(
    (sum, node) => sum + node.frequency,
    0
  );

  const arrayFrequencys = Object.values(frequencies).sort(
    (a, b) => b.frequency - a.frequency
  );
  console.log(arrayFrequencys)

  for (const node of arrayFrequencys) {
    const char = node.symbol;
    const frequency = node.frequency;
    const percentage = ((frequency / totalChars) * 100).toFixed(2);
    const code = encode[char];

    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${char === " " ? "Espacio" : char}</td>
            <td>${frequency} veces</td>
            <td>${percentage}%</td>
            <td>${code}</td>
        `;
    tableBody.appendChild(row);
  }
}

function encodeHuffman(text) {
  let Frequencies = getFrequencies(text);
  let ProrityQueue = constructPriorityQueue(Frequencies);
  let Huffman_Heap_Root = constructHuffman(ProrityQueue);
  getCode(Huffman_Heap_Root, "");
  let { nodes, edges } = visualizeHuffman(Huffman_Heap_Root);
  cytoVisualize(nodes, edges);
  populateEncoderTable(Frequencies, encode);
}

function cytoVisualize(nodes, edges) {
  var cy = cytoscape({
    container: document.getElementById("cy"),

    boxSelectionEnabled: false,
    autounselectify: true,

    style: [
      // the stylesheet for the graph
      {
        selector: "node",
        style: {
          "background-color": "#6600A1",
          label: "data(symbol)",
          "font-size": "30px",
          "text-halign": "center",
          "text-valign": "center",
          color: "ghostwhite",
        },
      },

      {
        selector: "edge",
        style: {
          width: 1,
          "line-color": "#8a9597",
          "target-arrow-color": "#ccc",
          "target-arrow-shape": "triangle",
          label: "data(label)",
        },
      },
    ],

    elements: {
      nodes: nodes,
      edges: edges,
    },

    layout: {
      name: "breadthfirst",
      directed: true,
      padding: 10,
      fit: true,
      spacingFactor: 1.5,
      avoidOverlap: true,
    },
  });
}
