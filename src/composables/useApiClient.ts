import { ref, reactive } from 'vue'
import { useCookies } from '@vueuse/integrations/useCookies'
import { useJwt } from '@vueuse/integrations/useJwt'
import type { JwtPayload } from 'jwt-decode'
import type { JSONResponse } from '@models/JSONSchema'
import LogService from '@services/LogService'
import { CatClient, type CancelablePromise, type AuthPermission, type AuthResource } from 'ccat-api'



const { DEV } = import.meta.env

const getPort = () => {
    if (DEV) return 1865
    if (window.location.port == '443' || window.location.port == '80') return undefined
    return parseInt(window.location.port)
}


/**
 * A function that wraps the promise request into a try/catch block
 * and check for errors to throw to the UI
 * @param request The axios promise function to await
 * @param success The message to return in case of success
 * @param error The message to return in case of error
 * @param log The log message/array of stuff to show
 * @returns A JSONResponse object containing status, message and optionally a data property
*/
const tryRequest = async <T>(
    request: CancelablePromise<T> | undefined,
    success: string,
    error: string,
    log: unknown[] | string = success,
) => {
    try {
        if (request == undefined) throw new Error('Failed to reach the endpoint')
            
            const result = (await request) as T
            
            if (typeof log === 'string') LogService.success(log)
        else LogService.success(...log)
    
        return {
            status: 'success',
            message: success,
            data: result,
        } as JSONResponse<T>
    } catch (err) {
        const msg = getErrorMessage(err, error)
        
        LogService.error(msg)
        
        return {
            status: 'error',
            message: msg,
        } as JSONResponse<T>
    }
}

const apiClient = new CatClient({
    baseUrl: window.location.hostname,
    port: getPort(),
    secure: window.location.protocol === 'https:',
    //credential: cookie.value, // will be set by `useApiClient()`
    timeout: 15000,
    instant: false,
    ws: {
        retries: 10,
        delay: 3000,
        onFailed: () => {
            console.error('Failed to connect WebSocket after several retries.')
        },
    },
})

/**
 * Composable to feed all services with the api client and the jwt token.
 * Should react to cookie changes and update the api client accordingly.
 */
export const useApiClient = () => {
    
    
    /**
     * API client to make requests to the endpoints and passing the JWT for authentication.
    */
   const cookies = useCookies(['ccat_user_token'], { doNotParse: true, autoUpdateDependencies: true })
   const cookie = computed(() => cookies.get<string | undefined>('ccat_user_token'))
   
   /**
    * get jwt content from the cookie
     */
    type AuthToken = JwtPayload & {
        username: string
        permissions: Record<AuthResource, AuthPermission[]>
    }
    const jwt = computed(() => {
        if (!cookie.value) return null
        const { payload } = useJwt<AuthToken>(cookie.value)
        return payload.value
    })
    
    if(apiClient.config.credential !== cookie.value) {
        apiClient.config.credential = cookie.value
        apiClient.init()
    }
    
    return {
        getPort,
        cookie,
        apiClient,
        jwt,
        tryRequest,
    }
}