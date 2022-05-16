<template>
  <div>
    <!-- <q-card>
    <q-card-section> -->
    <div class="text-h6 text-grey-8">
      <!-- Paint -->
       <button @click="isActive = !isActive" class="bg-primary">Options</button>
    </div>

    <!-- </q-card-section>
    <q-card-section> -->
    <div class="q-pa-none">
      <div v-if="isActive">
        {{ dynamicLineWidth }}px<br />
        <!-- <input
            type="range"
            @input="dynamicLineWidth = +$event.target.value"
            min="1"
            max="100"
          /> -->
        <q-slider
          v-model="dynamicLineWidth"
          color="primary"
          :min="1"
          :step="1"
          :max="100"
        />
        <!-- <input type="color" v-model="color" /><br /><br /> -->
        <q-color
          v-model="color"
          no-header
          no-footer
          default-view="palette"
          class="my-picker"
          :palette="[
            '#019A9D',
            '#D9B801',
            '#E8045A',
            '#B2028A',
            '#2A0449',
            '#019A9D'
          ]"
        />
        <br />
        <br />
        <q-btn icon="undo" @click="canvas.undo()" />
        <q-btn icon="redo" @click="canvas.redo()" />
        <!-- <q-btn icon="clear" @click="$refs.paintable.clearCanvas" /> -->
        <!-- <button @click="$refs.paintable.undoDrawingStep">undo</button> -->
        <!-- <button @click="$refs.paintable.redoDrawingStep">redo</button> -->

        <!-- <button @click="$refs.paintable.saveCurrentCanvasToStorage">
            save
          </button> -->
        <!-- <button @click="$refs.paintable.cancelDrawing">cancel</button> -->
        <q-toggle
          v-model="editingMode"
          checked-icon="select_all"
          color="red"
          label="Toggle Draw/Edit Mode"
          unchecked-icon="edit"
          size="xl"
        />
        <q-btn
          v-if="editingMode"
          icon="delete"
          @click="deleteSelectedObjects"
        />

        <!-- <q-btn
            icon="select_all"
            label="Editing"
            @click="editingMode = !editingMode"
            v-if="!editingMode"
          />
          <q-btn
            icon="edit"
            label="pencil"
            @click="editingMode = !editingMode"
            v-if="editingMode"
          /> -->
        <!-- <button @click="editingMode = !editingMode">
            {{ !editingMode ? "Editing" : "pencil" }}
          </button> -->
        <q-select v-model="imageSrc" :options="imageOptions" label="Image" />
      </div>
    </div>
    <!-- </q-card-section>
    <q-card-section> -->
    <div ref="canvas_div" class="row q-col-gutter-sm q-py-sm">
      <canvas ref="can" width="400" height="800"></canvas>
    </div>
    <!-- </q-card-section>
  </q-card> -->
  </div>
</template>

<script>
import { fabric } from "fabric";
import "fabric-history";
import { useEventStore } from 'stores/event'


export default {
  name: "draw",
  label: "Draw",
  icon: "brush",
  setup(){
     const eventStore = useEventStore()
     return {eventStore}
  },
  mounted() {
    var _this = this;

    window.addEventListener("resize", () => {
      this.clientWidth = this.$refs.canvas_div.clientWidth;
      this.clientHeight = this.$refs.canvas_div.clientHeight;
      this.scaleCanvas();
    });

    const ref = this.$refs.can;
    const canvas = new fabric.Canvas(ref, { isDrawingMode: true });

    this.clientWidth = this.$refs.canvas_div.clientWidth;
    this.clientHeight = this.$refs.canvas_div.clientHeight;

    // canvas.setDimensions({ height: window.innerHeight, width: width });
    var dataJSON = {}
    if ("draw" in this.eventStore.event){
        // this.eventStore.event.draw = {}
    
      dataJSON = JSON.parse(JSON.stringify(this.eventStore.event.draw.drawing));
      if ("targetImage" in this.eventStore.event.draw){
        this.imageSrc = this.eventStore.event.draw.targetImage;
      }
    }
    canvas.loadFromJSON(dataJSON, canvas.renderAll.bind(canvas));
    // canvas.offHistory()

    // TODO: make canvas depending on window size https://stackoverflow.com/questions/47219272/how-can-i-use-window-size-in-vue-how-do-i-detect-the-soft-keyboard

    // canvas.setBackgroundImage('http://fabricjs.com/assets/honey_im_subtle.png', canvas.renderAll.bind(canvas), {
    // canvas.setBackgroundImage(
    //   "statics/male_shadow.png",
    //   canvas.renderAll.bind(canvas),
    //   {
    //     // Needed to position backgroundImage at 0/0
    //     originX: "left",
    //     originY: "top",
    //     width: canvas.width,
    //     height: canvas.height
    //     // width: 100,
    //     // height: 600,
    //   }
    // );

    // canvas.undo()
    // canvas.redo()

    // canvas.clearHistory();
    // canvas.onHistory();
    // canvas.historyProcessing = false
    // canvas.add(rect);
    canvas.freeDrawingBrush.width = this.dynamicLineWidth;
    canvas.freeDrawingBrush.color = this.color;
    this.canvas = canvas;

    canvas.on("object:added", this.canvasModifiedCallback);
    canvas.on("object:removed", this.canvasModifiedCallback);
    canvas.on("object:modified", this.canvasModifiedCallback);
    canvas.on("object:skewing", this.canvasModifiedCallback);

    this.setBackgroundImage();
    // console.log(this.canvas.toJSON())
    // canvas.freeDrawingBrush = new fabric[this.value + 'Brush'](canvas);
  },
  watch: {
    imageSrc(newSrc, oldSrc) {
      this.setBackgroundImage();
    },
    editingMode(newVal, oldVal) {
      this.canvas.isDrawingMode = !newVal;
    },
    dynamicLineWidth(newVal, oldVal) {
      this.canvas.freeDrawingBrush.width = newVal;
    },
    color(newVal, oldVal) {
      this.canvas.freeDrawingBrush.color = newVal;
    }
  },
  //   windowHeight(newHeight, oldHeight) {
  //    var ratio = this.canvas.getWidth() / this.canvas.getHeight()
  //    var newWidth = ratio * newHeight
  //    this.canvas.setDimensions({ width: newWidth, height: newHeight });
  //    scaleRatio = newHeight / this.baseHeight
  //    canvas.setZoom(scaleRatio)
  //   }
  // },
  data() {
    return {
      windowHeight: window.innerHeight,
      clientWidth: 80,
      isFirstPaintable: true,
      hidePaintable: false,
      disableNavigation: true,
      dynamicLineWidth: 30,
      isActive: false,
      editingMode: false,
      color: "#000",
      imageSrc: "male_shadow.png",
      imageOptions: ["male_shadow.png", "female_shadow.png"]
    };
  },
  computed: {
    // ...mapState("paint", ["imageData"]),
    // width(){
    //   return
    // },
    navigation() {
      return {
        "draw-save": {
          body: "click here!",
          activeBody: "<strong>save</strong>"
        },
        color: {
          body: "color"
        }
      };
    }
  },
  methods: {
    setDefault(store){

    },
    canvasModifiedCallback() {
      // console.log('modified',this.canvas.toJSON())
      if (!("draw" in this.eventStore.event)){
          this.eventStore.event.draw = {}
      }
      let dataJSON = this.canvas.toJSON()
      if (dataJSON.objects.length == 0){
        delete this.eventStore.event.draw
      }else{
        this.eventStore.event.draw.drawing = dataJSON
        if (this.imageSrc){
        this.eventStore.event.draw.targetImage = this.imageSrc
      }
      }
      
      // this.$store.commit("paint/updateImageData", {
      //   backgroundImage: this.imageSrc,
      //   drawing: this.canvas.toJSON()
      // });
    },
    navigate() {
      this.isFirstPaintable = !this.isFirstPaintable;
    },
    hide() {
      this.$hidePaintableNavigation();
    },
    show() {
      this.$showPaintableNavigation();
    },
    toggledPaintable(isActive) {
      this.isActive = isActive;
    },
    deleteSelectedObjects() {
      this.canvas.getActiveObjects().forEach(obj => {
        this.canvas.remove(obj);
      });
      this.canvas.discardActiveObject().renderAll();
    },
    scaleCanvas() {
      // var ratio = Math.min(this.clientWidth/this.baseWidth,1)
      var ratio = this.clientWidth / this.baseWidth;
      var clientHeight = this.baseHeight * ratio;
      var clientWidth = this.clientWidth

      // var clientHeight = this.clientHeight
      // var ratio = this.clientHeight /  this.baseHeight
      // var clientWidth = this.clientWidth * ratio;

      this.canvas.setDimensions({ width: clientWidth, height: clientHeight });
      this.canvas.setZoom(ratio);
    },
    setBackgroundImage() {
      var canvas = this.canvas;
      var _this = this;
      fabric.Image.fromURL(this.imageSrc, function(img) {
        canvas.offHistory();

        img.set({
          originX: "left",
          originY: "top"
        });
        // var height = img.height
        // var height = windowHeight

        // var ratio = img.height / img.width;
        // var newHeight = ratio * canvas.width;
        // img.scaleToWidth(canvas.width);
        // img.scaleToHeight(newHeight);
        _this.baseWidth = img.width;
        _this.baseHeight = img.height;

        canvas.setDimensions({ width: img.width, height: img.height });
        // baseHeight = newHeight;
        canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));

        _this.scaleCanvas();

        canvas.onHistory();
        canvas.clearHistory();
      });
    }
  }
};
</script>

<style>
body {
  font-family: Helvetica, Arial, sans-serif;
  position: initial !important;
}
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
h3 {
  font-weight: normal;
}
.control {
  margin: 20px;
}
.paint {
  /* border: 5px solid #000; */
  border-radius: 5px;
  margin: 40px auto;
  box-sizing: border-box;
  display: block;
  width: 810px !important;
  height: 810px !important;
  position: relative !important;
  overflow: hidden;
}
footer {
  text-align: center;
}
footer a {
  color: #777;
  text-transform: uppercase;
  text-decoration: none;
}
button {
  border: 0;
  margin: 0 10px 0 0;
  font-size: 14px;
  padding: 10px 15px;
  opacity: 0.8;
  background-color: rgb(19, 102, 141);
  border-radius: 3px;
  color: #fff;
  cursor: pointer;
}
button:hover {
  opacity: 1;
}
.custom-navigation {
  position: fixed;
  top: 40px;
  left: 40px;
  z-index: 1001;
  background-color: #fff;
}
.custom-navigation .controls {
  margin: 10px 0 0 0;
  border: 1px solid #ddd;
  padding: 20px;
  border-radius: 5px;
}
</style>
