export type infoDataType = {
  imageSrc: string,
  title: string,
  description: string,
  routeTo?: string,
}

export interface InfoData {
  id: string,
  elements: Array<infoDataType>,
}
