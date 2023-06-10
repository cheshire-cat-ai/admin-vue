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
 * Defines the structure of a memory object.
 */
export interface Memory {
  readonly declarative: CollectionData[]
  readonly episodic: CollectionData[]
  readonly query: number[]
}
