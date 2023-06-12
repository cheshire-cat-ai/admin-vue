/**
 * Defines the structure of the metadata of a collection
 */
export interface MetaData {
  readonly source: string
  readonly when: number
}

/**
 * Defines the structure of a collection
 */
export interface CollectionData {
  readonly page_content: string
  readonly metadata: MetaData
  readonly score: number
  readonly vector: number[]
}

/**
 * Defines the structure of the query data that returns from the request
 */
export interface QueryData {
  readonly text: string,
  readonly vector: number[]
}

/**
 * Defines the structure of the vectors data that returns from the request
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
  readonly query: QueryData
  readonly vectors: VectorsData
}
