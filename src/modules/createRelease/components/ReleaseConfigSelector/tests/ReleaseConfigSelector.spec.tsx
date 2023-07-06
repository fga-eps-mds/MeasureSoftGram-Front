import React from "react";
import { fireEvent, render } from "@testing-library/react";
import ReleaseConfigSelector from "../ReleaseConfigSelector";

const createReleaseContextMock = () => ({
  setUseLastConfig: jest.fn(),
})

jest.mock('@modules/createRelease/context/useCreateRelease', () => ({
  ...jest.requireActual('@modules/createRelease/context/useCreateRelease'),
  useCreateReleaseContext: createReleaseContextMock
}));

describe("<ReleaseConfigSelector />", () => {
  describe("Snapshot", () => {
    it("Deve corresponder ao Snapshot", () => {
      const tree = render(<ReleaseConfigSelector setActiveStep={jest.fn()} />);
      expect(tree).toMatchSnapshot();
    })
  });

  it("Deve chamar o setActiveStep", () => {
    const setActiveStep = jest.fn();
    const { getByText } = render(<ReleaseConfigSelector setActiveStep={setActiveStep} />);
    const editConfigButton = getByText("Alterar configuração");
    expect(editConfigButton).toBeDefined();
    fireEvent.click(editConfigButton);
    expect(setActiveStep).toHaveBeenCalled();
  })

  it("Deve chamar o setUseLastConfig", () => {
    const setActiveStep = jest.fn();
    const { getByText } = render(<ReleaseConfigSelector setActiveStep={setActiveStep} />);
    const followLastConfigButton = getByText("Seguir última configuração");
    expect(followLastConfigButton).toBeDefined();
    fireEvent.click(followLastConfigButton);
    expect(setActiveStep).toHaveBeenCalled();
  })
});
