---
title: "Markdown Rendering Test"
date: "2025-07-01"
excerpt: "A comprehensive test file to verify the rendering of various Markdown features, including math, code tables, and GFM."
---

# H1 Heading
## H2 Heading
### H3 Heading
#### H4 Heading
##### H5 Heading
###### H6 Heading

## Text Formatting

*Italic text* using asterisks.
_Italic text_ using underscores.
**Bold text** using asterisks.
__Bold text__ using underscores.
***Bold and italic***.
~~Strikethrough~~.
`Inline code` looks like this.
[Link to Google](https://www.google.com).

## Lists

### Unordered List
- Item 1
- Item 2
    - Subitem 2.1
    - Subitem 2.2
- Item 3

### Ordered List
1. First item
2. Second item
    1. Subitem 2.1
    2. Subitem 2.2
3. Third item

### Task List
- [x] Completed task
- [ ] Incomplete task
- [ ] Another incomplete task

## Blockquote

> This is a blockquote.
> It can span multiple lines.
>> And it can be nested.

## Code Blocks

### JavaScript
```javascript
function hello() {
  console.log("Hello, world!");
}
hello();
```

### Python
```python
def fib(n):
    a, b = 0, 1
    while a < n:
        print(a, end=' ')
        a, b = b, a+b
    print()
fib(1000)
```

## Tables

| Syntax      | Description | Test Text     |
| :---        |    :----:   |          ---: |
| Header      | Title       | Here's this   |
| Paragraph   | Text        | And more      |
| **Bold**    | `Code`      | [Link](#)     |

## Math (LaTeX)

Inline math: $E = mc^2$

Display math:

$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$

Matrix:

$$
\begin{bmatrix}
1 & 2 & 3 \\
4 & 5 & 6 \\
7 & 8 & 9
\end{bmatrix}
$$

## Horizontal Rule

---

## Images

![Placeholder Image](https://via.placeholder.com/300x150)

## HTML Elements

<details>
<summary>Click to expand</summary>
This content is hidden by default.
</details>

<br />

The end.
