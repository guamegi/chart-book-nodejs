// import React from "react";
// import { render } from "@testing-library/react";
// import App from "./App";

// test('renders learn react link', () => {
//   const { getByText } = render(<App />);
//   const linkElement = getByText(/learn react/i);
//   expect(linkElement).toBeInTheDocument();
// });

function getUser(id) {
  return {
    id,
    email: `user${id}@test.com`,
  };
}

test("1 is 1", () => {
  expect(1).toBe(1);
});
test("return a user object", () => {
  expect(getUser(1)).toStrictEqual({ id: 1, email: "user1@test.com" });
});
test("number 0 is falsy but string 0 is truthy", () => {
  expect(0).toBeFalsy();
  expect("0").toBeTruthy();
});
test("array", () => {
  const colors = ["red", "yellow", "blue"];
  expect(colors).toHaveLength(3);
  expect(colors).toContain("red");
  expect(colors).not.toContain("redd");
});
