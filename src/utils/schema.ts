import { InputType, type SchemaField } from '@models/JSONSchema'
import { capitalize, entries } from 'lodash'

const getEnumValues = (property: Record<string, unknown>, definitions: Record<string, any>): any[] | undefined => {
	if (property['$ref']) {
		const name = (property['$ref'] as string).split('/').at(-1)
		if (!name) return undefined
		return definitions[name].enum
	} else if (property.allOf && Array.isArray(property.allOf)) {
		return getEnumValues(property.allOf[0], definitions)
	} else return undefined
}

export const generateVeeObject = (properties: Record<string, any>, definitions: Record<string, unknown>) => {
	return entries(properties).map<SchemaField>(([key, value]) => {
		return {
			name: key,
			as: getEnumValues(value, definitions) ? 'select' : 'input',
			label: value.title ?? capitalize(key),
			type: value.format ?? (value.type ? InputType[value.type as keyof typeof InputType] : undefined),
			rules: value.default == undefined ? 'required' : '',
			default: value.default,
			children: getEnumValues(value, definitions)?.map(v => ({ value: v, text: v })),
		}
	})
}
