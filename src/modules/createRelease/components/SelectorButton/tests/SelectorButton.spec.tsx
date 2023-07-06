import React from "react";
import { fireEvent, render } from "@testing-library/react";
import SelectorButton from "../SelectorButton";

describe("<Selector Button />", () => {
  describe("Snapshot", () => {
    it("Deve corresponder ao snapshot", () => {
      const tree = render(<SelectorButton label="label" onClick={jest.fn()} />);
      expect(tree).toMatchSnapshot();
    })
  });

  it("Deve chamar onClick ao clicar no botão", () => {
    const onClick = jest.fn();
    const { getByText } = render(<SelectorButton label="label" onClick={onClick} />);
    const button = getByText("label");
    expect(button).toBeDefined();
    fireEvent.click(button);
    expect(onClick).toBeCalled();
  })
});
