export type infoDataType = {
  imageSrc: string | JSX.Element,
  title: string,
  description: string,
  routeTo?: string,
}

export interface InfoData {
  id: string,
  title?: string,
  elements: Array<infoDataType>,
}
