export const getEnumValues = (property: Record<string, any>, definitions: Record<string, any>): any[] | undefined => {
    if (property['$ref']) {
        const name = (property['$ref'] as string).split("/").at(-1)
        if (!name) return undefined
        return definitions[name].enum
    }
    if (property.allOf && Array.isArray(property.allOf)) {
        getEnumValues(property.allOf[0], definitions)
    }
    else return undefined
}