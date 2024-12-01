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
  let min = Number.MAX_SAFE_INTEGER;
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
    let NewParentNode = {},
      node1 = {},
      node2 = {};

    let node1Indx = getTop(PriorityQueue);
    node1 = PriorityQueue[node1Indx];
    PriorityQueue.splice(node1Indx, 1);
    let node2Indx = getTop(PriorityQueue);
    node2 = PriorityQueue[node2Indx];
    PriorityQueue.splice(node2Indx, 1);

    NewParentNode.frequency = node1.frequency + node2.frequency;
    NewParentNode.symbol = PARENT;
    NewParentNode.left = node1;
    NewParentNode.right = node2;

    PriorityQueue.push(NewParentNode);
  }

  return PriorityQueue[0];
}

function getCode(root, code) {
  if (!root) return;
  if (root.symbol !== PARENT) {
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

  while (q.length !== 0) {
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
      for (let j = 0; j < map[i].length; j++) {
        let id = map[i][j];
        if (id === " ") id = "/s";
        if (map[i][j] === PARENT) {
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
      let cnt = 0;
      let par = 0;
      for (let j = 0; j < map[i].length; j++) {
        if (i !== 0) {
          if (cnt === 2) {
            cnt = 0;
            par++;
          }
          if (map[i - 1][par] !== PARENT) {
            par++;
            j--;
            continue;
          }
          cnt++;
          let parent = ids[i - 1][par];
          let child = ids[i][j];

          // Establece el label basado en la posición del hijo (izquierda = "0", derecha = "1")
          let label = cnt === 1 ? "0" : "1";

          edges.push({ data: { source: parent, target: child, label: label } });
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
  encode = {}; // Reset encoding map
  decode = {}; // Reset decoding map

  let Frequencies = getFrequencies(text);
  let PriorityQueue = constructPriorityQueue(Frequencies);
  let Huffman_Heap_Root = constructHuffman(PriorityQueue);

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
      {
        selector: ".highlighted",
        style: {
          "line-color": "#d4acec",
          "target-arrow-color": "#FF5733",
          "width": 3,
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

  cy.on("tap", "node", function (evt) {
    const node = evt.target;
    cy.edges().removeClass("highlighted"); 

    if (!node.data().symbol || node.data().symbol === PARENT) return;

    let connectedEdges = [];
    let currentNode = node;

    while (true) {
      let incomingEdge = currentNode.connectedEdges((edge) => edge.target().id() === currentNode.id());
      if (incomingEdge.length === 0) break;

      connectedEdges.push(incomingEdge[0]);
      currentNode = incomingEdge[0].source();
    }

    connectedEdges.forEach((edge) => edge.addClass("highlighted"));
  });
}