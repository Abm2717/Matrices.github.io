<script setup>
import { ref, watch, computed } from 'vue'
import { gauss, gaussJordan } from './Metodos.js'

const tamanoMatriz = ref('ninguno')
const metodoSeleccionado = ref('ninguno')
const mostrarAlerta = ref(false)
const msjAlerta = ref('')
const resultados = ref(null)

const matriz = ref([])
const vectorB = ref([])

const opcionesTamano = [
  { value: 'ninguno', label: 'Selecciona tamaño' },
  { value: '2', label: '2x2' },
  { value: '3', label: '3x3' },
  { value: '4', label: '4x4' }
]

const opcionesMetodos = [
  { value: 'ninguno', label: 'Selecciona metodo' },
  { value: 'gauss', label: 'Eliminacion de Gauss' },
  { value: 'gaussJordan', label: 'Gauss-Jordan' }
]

const nombresVariables = computed(() => {
  const n = parseInt(tamanoMatriz.value)
  if (isNaN(n)) return []
  const nombres = ['x', 'y', 'z', 'w']
  return nombres.slice(0, n)
})

watch(tamanoMatriz, (nuevoTamano) => {
  if (nuevoTamano === 'ninguno') {
    matriz.value = []
    vectorB.value = []
    return
  }
  
  const n = parseInt(nuevoTamano)
  matriz.value = Array(n).fill(null).map(() => Array(n).fill(''))
  vectorB.value = Array(n).fill('')
  resultados.value = null
})

watch(metodoSeleccionado, () => {
  resultados.value = null
})

function bloquearTeclas(event) {
  if(["e", "E"].includes(event.key)) {
    event.preventDefault()
    return
  }
}

function validarInputs() {
  if (tamanoMatriz.value === 'ninguno' || metodoSeleccionado.value === 'ninguno') {
    return false
  }
  
  const n = parseInt(tamanoMatriz.value)
  
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (matriz.value[i][j] === '' || matriz.value[i][j] === null) {
        return false
      }
    }
    if (vectorB.value[i] === '' || vectorB.value[i] === null) {
      return false
    }
  }
  
  return true
}

function cerrarAlerta() {
  mostrarAlerta.value = false
}

function resolverSistema() {
  mostrarAlerta.value = false
  
  if (!validarInputs()) {
    msjAlerta.value = 'Llena todos los campos de la matriz y el vector de terminos independientes'
    mostrarAlerta.value = true
    return
  }
  
  const n = parseInt(tamanoMatriz.value)
  
  const matrizAumentada = matriz.value.map((fila, i) => {
    const filaNum = fila.map(val => parseFloat(val))
    filaNum.push(parseFloat(vectorB.value[i]))
    return filaNum
  })
  
  try {
    let solucion
    const metodosLabels = {
      gauss: 'Eliminacion de Gauss',
      gaussJordan: 'Gauss-Jordan'
    }

    const matrizCopia = matrizAumentada.map(fila => [...fila])
    
    switch(metodoSeleccionado.value) {
      case 'gauss':
        solucion = gauss(matrizCopia)
        break
      case 'gaussJordan':
        solucion = gaussJordan(matrizCopia)
        break
      default:
        throw new Error('No se encontro metodo')
    }
    
    const solucionFormateada = solucion.map(val => parseFloat(val.toFixed(6)))
    
    resultados.value = {
      solucion: solucionFormateada,
      metodo: metodosLabels[metodoSeleccionado.value],
      tamano: n,
      variables: nombresVariables.value
    }
    
  } catch (error) {
    msjAlerta.value = 'Error al resolver el sistema: ' + error.message
    mostrarAlerta.value = true
  }
}

function limpiarMatriz() {
  const n = parseInt(tamanoMatriz.value)
  if (isNaN(n)) return
  
  matriz.value = Array(n).fill(null).map(() => Array(n).fill(''))
  vectorB.value = Array(n).fill('')
  resultados.value = null
}
</script>

<template>
  <div class="container">
    <h1>Resolver Sistemas de Ecuaciones Lineales</h1>
    <p>Selecciona el tamaño del sistema, ingresa los coeficientes y elige el metodo de resolucion.</p>
    
    <div v-if="mostrarAlerta" class="alerta">
      <div class="alerta-contenido">
        <span class="icono-alerta">⚠️</span>
        <span class="mensaje-alerta">{{ msjAlerta }}</span>
        <button class="boton-cerrar" @click="cerrarAlerta">×</button>
      </div>
    </div>

    <div class="selectores">
      <label class="selector-tamano">
        Tamaño del sistema
        <select v-model="tamanoMatriz" class="select-opcion">
          <option v-for="opcion in opcionesTamano" :key="opcion.value" :value="opcion.value">
            {{ opcion.label }}
          </option>
        </select>
      </label>
      
      <label class="selector-metodo">
        Metodo numerico
        <select v-model="metodoSeleccionado" class="select-opcion">
          <option v-for="opcion in opcionesMetodos" :key="opcion.value" :value="opcion.value">
            {{ opcion.label }}
          </option>
        </select>
      </label>
    </div>

    <div v-if="tamanoMatriz !== 'ninguno'" class="seccion-matriz">
      <div class="matriz-header">
        <h3>Matriz de Coeficientes y Terminos Independientes</h3>
        <button @click="limpiarMatriz" class="boton-limpiar">
          Limpiar Matriz
        </button>
      </div>
      
      <div class="matriz-container">
        <div class="ecuaciones-wrapper">
          <div class="ecuaciones-lista">
            <div v-for="(fila, i) in matriz" :key="'ecuacion-' + i" class="ecuacion-fila">
              <template v-for="(coef, j) in fila" :key="'coef-' + i + '-' + j">
                <input
                  type="number"
                  v-model.number="matriz[i][j]"
                  @keydown="bloquearTeclas"
                  step="0.01"
                  class="input-coef"
                />
                <span class="variable-label">{{ nombresVariables[j] }}</span>
                <span v-if="j < fila.length - 1" class="operador">+</span>
              </template>
              <span class="igual-label">=</span>
              <input
                type="number"
                v-model.number="vectorB[i]"
                @keydown="bloquearTeclas"
                step="0.01"
                class="input-resultado"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="tamanoMatriz !== 'ninguno'" class="botones-accion">
      <button @click="resolverSistema" class="boton-principal">
        Resolver Sistema
      </button>
    </div>

    <div v-if="resultados" class="resultados-wrapper">
      <div class="resultados-header">
        <h2>Solucion del Sistema</h2>
        <div class="metodo-usado">
          <span class="metodo-badge">{{ resultados.metodo }}</span>
        </div>
      </div>
      
      <div class="soluciones-grid">
        <div 
          v-for="(valor, i) in resultados.solucion" 
          :key="'sol-' + i" 
          class="solucion-item"
          :class="'solucion-' + (i % 4)"
        >
          <span class="solucion-variable">{{ resultados.variables[i] }}</span>
          <span class="solucion-igual">=</span>
          <span class="solucion-valor">{{ valor }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1100px;
  margin: auto;
  padding: 2rem;
  background: #242424;
  border-radius: 1rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.6);
  font-family: system-ui, sans-serif;
  color: #f9fafb;
}

h1 {
  text-align: center;
  color: #60a5fa;
  margin-bottom: 1rem;
  font-size: 1.8rem;
}

p {
  color: #d1d5db;
  text-align: center;
  margin-bottom: 1.5rem;
}

/* Alerta */
.alerta {
  margin-bottom: 1rem;
  animation: slideDown 0.3s ease-out;
}

.alerta-contenido {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  background: #7c2d12;
  border: 1px solid #dc2626;
  border-radius: 0.5rem;
  color: #fef2f2;
  position: relative;
}

.icono-alerta {
  margin-right: 0.5rem;
  font-size: 1.2rem;
}

.mensaje-alerta {
  flex: 1;
  font-weight: 500;
}

.boton-cerrar {
  background: none;
  border: none;
  color: #fef2f2;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  margin: 0;
  margin-left: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.boton-cerrar:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Selectores */
.selectores {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.selector-tamano,
.selector-metodo {
  display: flex;
  flex-direction: column;
  font-size: 0.9rem;
  color: #e5e7eb;
  flex: 1;
  min-width: 250px;
}

.select-opcion {
  padding: 0.5rem;
  border: 1px solid #444;
  border-radius: 0.5rem;
  margin-top: 0.3rem;
  background: #1f1f1f;
  color: #f9fafb;
  transition: border-color 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.select-opcion:focus {
  outline: none;
  border-color: #60a5fa;
  box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.2);
}

.seccion-matriz {
  background: #1f1f1f;
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid #333;
}

.matriz-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.matriz-header h3 {
  color: #60a5fa;
  margin: 0;
  font-size: 1.2rem;
}

.boton-limpiar {
  padding: 0.5rem 1rem;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.boton-limpiar:hover {
  background: #b91c1c;
  transform: translateY(-1px);
}

/* Matriz container */
.matriz-container {
  display: flex;
  justify-content: center;
  padding: 1rem;
}

.ecuaciones-wrapper {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.ecuaciones-lista {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.ecuacion-fila {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.input-coef,
.input-resultado {
  width: 80px;
  height: 45px;
  padding: 0.3rem;
  border: 2px solid #444;
  border-radius: 0.5rem;
  background: #2d2d2d;
  color: #f9fafb;
  text-align: center;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.2s;
}

.input-coef:focus,
.input-resultado:focus {
  outline: none;
  border-color: #60a5fa;
  box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.2);
  background: #1f1f1f;
}

.input-coef::-webkit-outer-spin-button,
.input-coef::-webkit-inner-spin-button,
.input-resultado::-webkit-outer-spin-button,
.input-resultado::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.input-coef[type="number"],
.input-resultado[type="number"] {
  -moz-appearance: textfield;
}

.variable-label {
  font-size: 1.3rem;
  font-weight: 600;
  color: #60a5fa;
  font-style: italic;
  margin-right: 0.25rem;
}

.operador {
  font-size: 1.2rem;
  color: #d1d5db;
  margin: 0 0.25rem;
}

.igual-label {
  font-size: 1.3rem;
  color: #60a5fa;
  font-weight: 600;
  margin: 0 0.5rem;
}

/* Botones */
.botones-accion {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.boton-principal {
  padding: 0.8rem 2rem;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.boton-principal:hover {
  background: linear-gradient(135deg, #1d4ed8, #1e40af);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4);
}

/* Resultados */
.resultados-wrapper {
  margin-top: 2rem;
  background: #1f1f1f;
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid #333;
  animation: fadeIn 0.5s ease-out;
}

.resultados-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.resultados-header h2 {
  color: #60a5fa;
  margin: 0;
  font-size: 1.4rem;
}

.metodo-badge {
  background: linear-gradient(135deg, #059669, #047857);
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
}

/* Soluciones */
.soluciones-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.solucion-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 2px solid;
  transition: transform 0.2s ease;
}

.solucion-item:hover {
  transform: translateY(-2px);
}

.solucion-0 {
  background: rgba(34, 197, 94, 0.1);
  border-color: #22c55e;
}

.solucion-1 {
  background: rgba(168, 85, 247, 0.1);
  border-color: #a855f7;
}

.solucion-2 {
  background: rgba(249, 115, 22, 0.1);
  border-color: #f97316;
}

.solucion-3 {
  background: rgba(59, 130, 246, 0.1);
  border-color: #3b82f6;
}

.solucion-variable {
  font-size: 1.8rem;
  font-weight: 700;
  font-style: italic;
}

.solucion-0 .solucion-variable { color: #22c55e; }
.solucion-1 .solucion-variable { color: #a855f7; }
.solucion-2 .solucion-variable { color: #f97316; }
.solucion-3 .solucion-variable { color: #3b82f6; }

.solucion-igual {
  font-size: 1.5rem;
  color: #d1d5db;
}

.solucion-valor {
  font-size: 1.5rem;
  font-weight: 700;
  font-family: 'Courier New', monospace;
  color: #f9fafb;
}


/* Responsive */
@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }
  
  .selectores {
    flex-direction: column;
  }
  
  .llave-izq {
    font-size: 5rem;
  }
  
  .ecuacion-fila {
    font-size: 0.9rem;
  }
  
  .input-coef,
  .input-resultado {
    width: 60px;
    height: 40px;
    font-size: 0.9rem;
  }
  
  .variable-label {
    font-size: 1.1rem;
  }
  
  .soluciones-grid {
    grid-template-columns: 1fr;
  }
}

/* Animaciones */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>