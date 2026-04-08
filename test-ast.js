import { unified } from "unified";
import remarkParse from "remark-parse";

const doc = `---
marp: true
theme: default
paginate: true
header: "HP7: Cyber Security for AIoT | Bài 04"
footer: "© Pathway AIoT Curriculum | @content"
style: |
  section {
    background-color: #050a14;
    color: #c9d1d9;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }
  h1 {
    color: #00BFFF;
    text-shadow: 0 0 10px rgba(0, 191, 255, 0.5);
  }
---

## Unit 7: Security | Mutual TLS
`;

const tree = unified().use(remarkParse).parse(doc);
console.log(JSON.stringify(tree.children.map(c => ({ type: c.type, value: c.value, tagName: c.tagName })), null, 2));
