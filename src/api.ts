
import type { PureAbility as Ability } from '@casl/ability'
import { CatClient, type CancelablePromise, type AuthPermission, type AuthResource } from 'ccat-api'


export type AppAbility = Ability<[AuthPermission, AuthResource]>

// TODO: Fix why this is not working
declare module 'vue' {
	export interface ComponentCustomProperties {
		$ability: AppAbility
		$can(this: this, ...args: Parameters<this['$ability']['can']>): boolean
	}
}
