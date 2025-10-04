//Funcion para encontrar el valor mayor y hacer pivoteo
export function mayorColumna(matriz, k) {
    let filaMax = k
    let valorMax = Math.abs(matriz[k][k])
    for (let i = k + 1; i < matriz.length; i++) {
        if (Math.abs(matriz[i][k]) > valorMax) {
            valorMax = Math.abs(matriz[i][k])
            filaMax = i
        }
    }
    return filaMax
}

export function gauss(matriz) {
    const n = matriz.length

    for (let k = 0; k < n - 1; k++) {
        // Pivoteo parcial
        const filaMax = mayorColumna(matriz, k)
        if (filaMax !== k) {
            const temp = matriz[k]
            matriz[k] = matriz[filaMax]
            matriz[filaMax] = temp
        }
        for (let i = k + 1; i < n; i++) {
            const factor = matriz[i][k] / matriz[k][k]
            for (let j = k; j <= n; j++) {
                matriz[i][j] -= factor * matriz[k][j]
            }   
        }
    }
    return sustitucionAtras(matriz)
}

function sustitucionAtras(matriz) {
    const n = matriz.length
    const x = new Array(n).fill(0)  
    for (let i = n - 1; i >= 0; i--) {
        x[i] = matriz[i][n]
        for (let j = i + 1; j < n; j++) {
            x[i] -= matriz[i][j] * x[j]
        }
        x[i] /= matriz[i][i]
    }
    return x
}

export function gaussJordan(matriz) {
    const n = matriz.length

    for (let k = 0; k < n; k++) {
        
        const filaMax = mayorColumna(matriz, k)
        if (filaMax !== k) {
            [matriz[k], matriz[filaMax]] = [matriz[filaMax], matriz[k]]
        }

        
        const pivote = matriz[k][k]
        for (let j = k; j <= n; j++) {
            matriz[k][j] /= pivote
        }

        
        for (let i = 0; i < n; i++) {
            if (i !== k) {
                const factor = matriz[i][k]
                for (let j = k; j <= n; j++) {
                    matriz[i][j] -= factor * matriz[k][j]
                }
            }
        }
    }

    // La última columna ya es la solución
    return matriz.map(fila => fila[n])
}