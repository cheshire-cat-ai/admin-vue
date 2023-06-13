/**
 * Defines the structure of the metadata of a collection
 */
export interface MetaData {
  readonly source: string
  readonly when: number
}

/**
 * Defines the structure of a collection that returns from the recall
 */
export interface CollectionData {
  readonly page_content: string
  readonly metadata: MetaData
  readonly score: number
  readonly vector: number[]
}

/**
 * Defines the structure of a collection
 */
export interface Collection {
  readonly name: string,
  readonly vectors_count: number
}

/**
 * Defines the structure of the vectors data that returns from the recall
 */
export interface VectorsData {
  readonly embedder: string
  readonly collections: {
    readonly [key: string]: CollectionData[]
  }
}

/**
 * Defines the structure of a memory object.
 */
export interface Memory {
  readonly query: {
    readonly text: string,
    readonly vector: number[]
  }
  readonly vectors: VectorsData
}
