interface Metadata {
  readonly source: string
  readonly when: number
}

interface Collection {
  readonly page_content: string
  readonly metadata: Metadata
  readonly score: number
}

/**
 * Defines the structure of a memory object.
 */
export interface Memory {
  readonly declarative: Collection[]
  readonly episodic: Collection[]
}
