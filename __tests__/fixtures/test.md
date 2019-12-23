---
layout: post
title: 'Avoiding recursive useEffect hooks in React'
intro: A short post today about an easy tactic to avoid your useEffect calls becoming recursive when setting state.
---

It's fair to say that React 16.8 and the introduction of
[hooks](https://reactjs.org/docs/hooks-intro.html) has really changed how we
write React. Hooks are one of those APIs that make you realise the flaws of the
previous approach _after_ you stop using it. I remember being very skeptical of
hooks when they were first released, not thinking that the previous class based
design had many flaws, but I've since come to realise I was very wrong, and
hooks are a vast improvement on how we build React components. If you're
interested in comparing the old vs the new, I wrote a
[blog post refactoring a component to use hooks](/refactoring-to-react-hooks/)
that offers a nice comparison.
