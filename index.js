const Nebula = {}

Nebula.exec = async function(req, env, params) {
    const method = req['@method'] || 'GET'
    const obj = {...req, ...params}
    let action

    if(method == 'GET' || method == 'HEAD') {
        const url = new URL(req['@url'])
        const query = new URLSearchParams()

        for(const key of Object.keys(obj)) {
            if(key != '@url' && key != '@method')
                query.set(key, JSON.stringify(obj[key]))
        }

        url.search = query
        action = await (await fetch(url.toString(), {
            method: method,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        })).json()
    } else {
        const body = {}

        for(const key of Object.keys(obj)) {
            if(key != '@url' && key != '@method')
                body[key] = obj[key]
        }

        action = await (await fetch(req['@url'], {
            method: method,
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body)
        })).json()
    }

    if(Array.isArray(action)) {
        for(const instr of action)
            env[instr['@action']](instr, Nebula.exec, env)
    } else
        env[action['@action']](action, Nebula.exec, env)
}

Nebula.handles = {}

Nebula.alloc = function(val) {
    let handle = ''
    let alpha = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

    for(let i = 0; i < 16; i++)
        handle += alpha[Math.floor(Math.random() * alpha.length)]

    Nebula.handles[handle] = val
    return handle
}

Nebula.delete = handle => delete Nebula.handles[handle]

Nebula.env = {
    delete: action => Nebula.delete(action.value),
    invoke: (action, exec, env) => exec(action.request, env)
}

export default Nebula