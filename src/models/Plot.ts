export interface MarkerData {
	id: string
	collection: string
	text: string
	when: string
	source: string
	score: number
}

export interface PlotData {
	name: string
	data: {
		x: number
		y: number
	}[]
	meta?: MarkerData[]
}
