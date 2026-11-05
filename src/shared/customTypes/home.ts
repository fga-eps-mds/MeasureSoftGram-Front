export type infoDataType = {
  imageSrc: string | React.JSX.Element;
  title: string;
  description: string;
  routeTo?: string;
};

export interface InfoData {
  id: string;
  title?: string;
  elements: Array<infoDataType>;
}
