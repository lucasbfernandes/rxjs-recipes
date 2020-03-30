const { Rxios } = require('rxios')
const { delay, retryWhen, tap, map, concatMap } = require('rxjs/operators')
const { throwError, of } = require('rxjs')

const http = new Rxios()

const MAXIMUM_ATTEMPTS = 3
const MILLISECONDS_DELAY = 2000

const getErrorRetryPipe = (error, attempts) => {
    return of(error).pipe(
        tap(() => console.log(`Attempt #${attempts + 1}. Retrying job: ${error}`)),
        delay(MILLISECONDS_DELAY)
    )
}

const getErrorRetryCondition =  error => error.pipe(
    concatMap((error, attempts) => {
        return attempts >= MAXIMUM_ATTEMPTS ?
            throwError('Reached maximum attemps.') :
            getErrorRetryPipe(error, attempts)
    })
)

const requestObservable = 
    http.post('<service-url>', {})
        .pipe(
            map(response => response),
            retryWhen(error => getErrorRetryCondition(error))
        )

requestObservable.subscribe(
    response => { console.log(`SUCCESSFULY STARTED JOB. RESPONSE: ${JSON.stringify(response)}`)},
    error => { console.log(`COULD NOT START JOB. ERROR: ${error}`)}
)

process.stdin.resume() 