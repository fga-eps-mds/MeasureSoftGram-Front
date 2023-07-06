import { fireEvent, render } from "@testing-library/react";
import React from "react";
import ThresholdSlider from "../ThresholdSlider";

interface SliderMockProps {
  onChange: (event: any) => void;
}

const SliderMock = ({ onChange }: SliderMockProps) => (
  <input data-testid="threshold-slider" onChange={onChange} />);

interface TextFieldMockProps {
  onChange: (event: any) => void;
}
const TextFieldMock = ({ onChange }: TextFieldMockProps) => <input data-testid="threshold-textfield" onChange={onChange} />;

jest.mock("@mui/material/Slider", () => SliderMock);

jest.mock("@mui/material/TextField", () => TextFieldMock);

describe("<ThresholdSlider />", () => {
  describe("Snapshot", () => {
    it("Deve corresponder ao snapshot", () => {
      const tree = render(<ThresholdSlider label="duplication_absense" onChange={jest.fn()} min={0} max={100} />);
      expect(tree).toMatchSnapshot();
    })
  });

  it("Deve chamar changeSlider ao alterar o valor do slider", () => {
    const onChange = jest.fn();
    const { getByTestId } = render(<ThresholdSlider label="duplication_absense" onChange={onChange} min={0} max={100} />);
    const sliderInput = getByTestId("threshold-slider");
    expect(sliderInput).toBeDefined();
    fireEvent.change(sliderInput, { target: { value: [50, 80] } })
    expect(onChange).toBeCalled();
  })

  it("Deve chamar onChange ao alterar o valor do textfield", () => {
    const onChange = jest.fn();
    const { getAllByTestId } = render(<ThresholdSlider label="duplication_absense" onChange={onChange} min={0} max={100} />);
    const textFieldInputs = getAllByTestId("threshold-textfield");
    expect(textFieldInputs[0]).toBeDefined();
    expect(textFieldInputs[1]).toBeDefined();
    fireEvent.change(textFieldInputs[0], { target: { value: 50 } })
    fireEvent.change(textFieldInputs[1], { target: { value: 80 } })
    expect(onChange).toBeCalled();
  })
});
