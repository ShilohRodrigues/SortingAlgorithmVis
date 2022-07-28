/* DOM elements */
btnNewData = document.getElementById('btnNewData')
btnSort = document.getElementById('btnSort')
btnBubble = document.getElementById('bubble')
btnInsertion = document.getElementById('insertion')
btnSelection = document.getElementById('selection')
btnBozo = document.getElementById('bozo')
btnQuick = document.getElementById('quick')
btnMerge = document.getElementById('merge')
sliderSize = document.getElementById('sliderSize')
sliderSpeed = document.getElementById('sliderSpeed')

/* Global Vars */
let dataSize = 50
const MAX_DATA_VAL = 100
let sortSpeed = 50 //ms
let dataSet = []
let selectedSort = btnBubble
let CANCEL = false

/* Event Listeners */
btnNewData.addEventListener('click', generateNewDataset)
btnBubble.addEventListener('click', selectSortMode)
btnInsertion.addEventListener('click', selectSortMode)
btnSelection.addEventListener('click', selectSortMode)
btnBozo.addEventListener('click', selectSortMode)
btnQuick.addEventListener('click', selectSortMode)
btnMerge.addEventListener('click', selectSortMode)

//Selects sort mode 
function selectSortMode() {

  //Remove the selection from the current sort mode
  selectedSort.classList.remove('selected')
  //Select the sort mode that was just clicked
  this.classList.add('selected')
  selectedSort = this

}

/**** When option selections are changed *****/
sliderSize.addEventListener('change', () => {

  dataSize = sliderSize.value
  generateNewDataset()

})
sliderSpeed.addEventListener('change', () => {

  sortSpeed = sliderSpeed.value

})

//Generates a new dataset 
generateNewDataset()
function generateNewDataset() {
  //Reset the current dataset
  dataSet = []
  //Create a new data value between 1 and the max
  for (let i = 0; i<dataSize; i++) {
    dataSet.push(Math.floor(Math.random() * (MAX_DATA_VAL) + 1))
  }
  
  console.log(dataSet);
  createChart()
}

/**** Chart Configurations ****/
function createChart() {

  //Create color array
  let colorArr = []
  for (i=0; i<dataSize; i++) {
    colorArr.push('#030A8C')
  }

  const data = {
    labels: dataSet,
    datasets: [{
      backgroundColor: colorArr,
      borderColor: colorArr,
      data: dataSet,
    }]
  };
  const config = {
    type: 'bar',
    data: data,
    options: {
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          enabled: false
        }
      },
      scales: {
        xAxes: {
            ticks: {
                display: false
            }
        }
      }
    }
  };
  //Check if the chart already exists and destroy it to create a new one
  let chartStatus = Chart.getChart("chart"); // <canvas> id
  if (chartStatus != undefined) chartStatus.destroy()
  //Create Chart
  const myChart = new Chart(
    document.getElementById('chart'),
    config
  );

}

//Sort Button Click
btnSort.addEventListener('click', async () => {

  //Check if cancel sort button was clicked to cancel
  if (btnSort.innerHTML == 'Cancel Sorting') {

    CANCEL = true
    disableControls(false)
    return 
    
  }

  CANCEL = false

  //Disable controls
  disableControls()

  //Determine which sorting algorithm to use
  switch(selectedSort.id) {
    case 'bubble':
      await bubbleSort()
      break;
    case 'insertion':
      await insertionSort()
      break;
    case 'selection':
      await selectionSort()
      break;
    case 'bozo':
      await bozoSort()
      break;
    case 'merge':
      await mergeSort()
      break;
    case 'quick':
      await quickSort()
      break;
  }

  console.log(dataSet);
  //Set all the bars to green
  Chart.getChart("chart").data.datasets[0].backgroundColor = '#05A65B'
  Chart.getChart("chart").update('none')

  disableControls(false)

})

//Disables the controls when the program is sorting
//boolean to indicate whether to disable or enable
function disableControls(disable = true) {

  //Disable controls
  if (disable == true) {
    btnSort.style.backgroundColor = 'red'
    btnSort.innerHTML = 'Cancel Sorting'
    btnNewData.classList.add('disabled')
    sliderSize.classList.add('disabled')
    sliderSpeed.classList.add('disabled')
  }
  //Enable controls
  else { 
    btnSort.style.backgroundColor = '#05A65B'
    btnSort.innerHTML = 'Sort!'
    btnNewData.classList.remove('disabled')
    sliderSize.classList.remove('disabled')
    sliderSpeed.classList.remove('disabled')  
  }
  
  sliderSize.disabled = disable
  sliderSpeed.disabled = disable
  btnNewData.disabled = disable

}

/***** Sorting Algos ******/

//Swaps the data from index i to index j in the dataSet array
function swap(i, j) {

  return new Promise((resolve) => {

    let temp = dataSet[i]
    dataSet[i] = dataSet[j]
    dataSet[j] = temp 

    //Waits for new animation frame before updating 
    window.requestAnimationFrame(function() {
      // Update chart after waiting the value of sortSpeed
      setTimeout(() => {
        Chart.getChart("chart").update('none')
        resolve()
      }, sortSpeed);
    });

  })

}

function bubbleSort() {

  return new Promise(async (resolve) => {

    for (let i=0; i<dataSize; i++) {

      let sorted = true
      for (let j=0; j<(dataSize-i); j++) {
        
        if(CANCEL) return

        //Highlight the selected bars in the graph
        Chart.getChart("chart").data.datasets[0].backgroundColor[j-1] = '#030A8C'
        Chart.getChart("chart").data.datasets[0].backgroundColor[j] = '#05A65B'
        Chart.getChart("chart").data.datasets[0].backgroundColor[j+1] = '#05A65B'

        //If the current data is larger than the next one... 
        if (dataSet[j] > dataSet[j+1]) {
          //swap them and wait for it to finish
          await swap(j, j+1)
          sorted = false //sorted = false since there was a swap
        }
  
      }
      
      //Make the last largest bar green to signify that it is in the correct place 
      Chart.getChart("chart").data.datasets[0].backgroundColor[dataSize-i-1] = '#05A65B'

      //If sorted is true by the end, there were no swaps meaning it is ordered
      if (sorted) resolve()
  
    }

  })

}

function insertionSort() {

  return new Promise(async (resolve) => {

    //Loop through the dataset sarting after the first index
    for(let i=1; i<dataSize; i++) {

      let key = dataSet[i]
      let j = i-1
      
      //Loop downward from the index before i and swap with any value lower than the key
      while ((j >= 0) && (dataSet[j] > key)) {
        
        if(CANCEL) return

        Chart.getChart("chart").data.datasets[0].backgroundColor[j+1] = '#030A8C'
        await swap(j+1, j)
        Chart.getChart("chart").data.datasets[0].backgroundColor[j+1] = '#05A65B'
        j--

      }
      Chart.getChart("chart").data.datasets[0].backgroundColor[i-1] = '#05A65B'

    }
    
    resolve()

  })

}

function selectionSort() {

  return new Promise(async (resolve) => {

    let minI

    //Loop through the dataset sarting at the 0th index
    for(let i=0; i<dataSize-1; i++) {
    
      minI = i
      Chart.getChart("chart").data.datasets[0].backgroundColor[i] = '#05A65B'
      //Loop from index i and find the minimum value 
      for (j = i+1; j < dataSize; j++) {
        if(CANCEL) return
        if (dataSet[j] < dataSet[minI]) minI = j
      }
      //Swap the next minimum with the current index
      await swap(minI, i)
    
    }

    resolve()
    
  })

}

function bozoSort() {

  return new Promise(async (resolve) => {
  
    let sorted = false
    //Loop while not sorted
    while (!sorted) {

      if(CANCEL) return

      //Loop through the array to check if it is sorted
      sorted = true
      for(let i=0; i<dataSize-1; i++) 
        if(dataSet[i] > dataSet[i+1]) sorted = false
      //If it is not sorted then swap two random indexs
      if(!sorted) {
        let i = Math.floor(Math.random() * dataSize)
        let j = Math.floor(Math.random() * dataSize)
        Chart.getChart("chart").data.datasets[0].backgroundColor[i] = '#05A65B'
        Chart.getChart("chart").data.datasets[0].backgroundColor[j] = '#05A65B'

        await swap(i, j)

        Chart.getChart("chart").data.datasets[0].backgroundColor[i] = '#030A8C'
        Chart.getChart("chart").data.datasets[0].backgroundColor[j] = '#030A8C'
      }

    }
    
    resolve()
    
  })

}

async function mergeSort(l=0, r=(dataSize-1)) {

  if (l >= r) return

  let m = l + parseInt((r-l)/2)
  await mergeSort(l, m)
  await mergeSort(m+1, r)
  await merge(l, m, r)

}

function merge(l, m, r) {

  return new Promise(async (resolve) => {
    
    //temporary arrays
    let n1 = m - l + 1
    let n2 = r - m
    let L = new Array(n1)
    let R = new Array(n2)

    //Copy data into the temp arrays
    for (let i=0; i<n1; i++)
      L[i] = dataSet[l+i]
    for (let i=0; i<n2; i++)
      R[i] = dataSet[m + 1 + i]
    
    //Indexes of the first, second and the merged array
    let i=0, j=0, k=l

    //Merge the two arrays back into the main array 
    while (i<n1 && j<n2) {

      if (CANCEL) return

      if (L[i] <= R[j]) {
        dataSet[k] = L[i];
        //Chart.getChart("chart").data.datasets[0].backgroundColor[i] = '#05A65B'
        i++;
      }
      else {
        dataSet[k] = R[j];
        j++;
      }
      Chart.getChart("chart").data.datasets[0].backgroundColor[k] = '#05A65B'
      k++;  
      await wait()

    }

    // Copy the remaining elements of L
    while (i < n1) {

      if (CANCEL) return
      
      dataSet[k] = L[i];
      Chart.getChart("chart").data.datasets[0].backgroundColor[k] = '#05A65B'
      i++;
      k++;
      await wait()

    }

    // Copy the remaining elements of R
    while (j < n2) {

      if (CANCEL) return
      
      dataSet[k] = R[j];
      Chart.getChart("chart").data.datasets[0].backgroundColor[k] = '#05A65B'
      j++;
      k++;
      await wait()

    }

    resolve()
  })

}

async function quickSort(l=0, h=(dataSize-1)) {

  if (l >= h) return
  let pi = await partition(l, h)
  await quickSort(l, pi-1)
  await quickSort(pi+1, h)

}

function partition(l, h) {

  return new Promise(async (resolve) => {

    let pi = dataSet[h]
    let i = (l-1)

    for(let j=l; j<=(h-1); j++) {

      if(dataSet[j] < pi) {
        i++
        await swap(i, j)
        Chart.getChart("chart").data.datasets[0].backgroundColor[i] = '#05A65B'
        Chart.getChart("chart").data.datasets[0].backgroundColor[j] = '#05A65B'
      }
    }

    await swap(i+1, h)

    resolve(i+1)

  }) 

}

function wait() {
  return new Promise(resolve => {
    //Waits for new animation frame before updating 
    window.requestAnimationFrame(function() {
      // Update chart after waiting the value of sortSpeed
      setTimeout(() => {
        Chart.getChart("chart").update('none')
        resolve()
      }, sortSpeed);
    }); 
  })
  
}