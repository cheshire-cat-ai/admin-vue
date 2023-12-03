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

const getComponentType = (value: any, definitions: Record<string, unknown>) => {
	if (value.extra && value.extra.type && typeof value.extra.type == 'string' && value.extra.type.toLowerCase() == 'textarea')
		return 'textarea'
	else if (getEnumValues(value, definitions)) return 'select'
	else return 'input'
}

export const generateVeeObject = (schema: Record<string, any> | undefined) => {
	if (!schema) return []
	return entries(schema.properties).map<SchemaField>(([key, value]: [string, any]) => {
		return {
			name: key,
			as: getComponentType(value, schema['$defs']),
			label: value.title ?? capitalize(key),
			description: value.description,
			type: value.format ?? (value.type ? InputType[value.type as keyof typeof InputType] : undefined),
			rules: value.default == undefined ? 'required' : '',
			default: value.default,
			children: getEnumValues(value, schema['$defs'])?.map(v => ({ value: v, text: v })),
		}
	})
}
