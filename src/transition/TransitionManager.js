import GuiOptions from '../components/Gui'
class TransitionManager {
  // scenes: [sceneRef0, sceneRef1, ...]
  constructor(scenes, transition, datGuiOverride) {
    this.scenes = scenes
    this.transition = transition
    this.datGuiOverride = datGuiOverride
    this.currentScene = 0
    this.numTimesTransitioned = 0
  }

  update(elapsedTime) {
    const { datGuiOverride, transition, scenes, currentScene, numTimesTransitioned } = this
    transition.update(elapsedTime)
    const { options: { currentScene: nextScene } } = GuiOptions

    if (datGuiOverride && currentScene !== nextScene && nextScene < this.scenes.length) {
      transition.setNextScene(scenes[nextScene], numTimesTransitioned % 2 !== 0)
      transition.setupTransition(elapsedTime)
      this.currentScene = nextScene
      this.numTimesTransitioned++
      return
    }

    /*
     * example for controlling Transitions using MIDI
    if (JSON.stringify(midi.lastNotes.slice(0, 3)) === JSON.stringify([79, 77, 76]) && this.currentScene === 0) {
      transition.setupTransition(elapsedTime)
      this.currentScene = 1
      this.numTimesTransitioned++
    } else if (JSON.stringify(midi.lastNotes.slice(0, 3)) === JSON.stringify([80, 77, 76]) && this.currentScene === 1) {
      transition.setNextScene(scenes[2], true)
      transition.setupTransition(elapsedTime)
      this.currentScene = 2
      this.numTimesTransitioned++
    } else if (JSON.stringify(midi.lastNotes.slice(0, 3)) === JSON.stringify([81, 77, 76]) && this.currentScene === 2) {
      transition.setNextScene(scenes[3], false)
      transition.setupTransition(elapsedTime)
      this.currentScene = 3
      this.numTimesTransitioned++
    }
    */
  }
}

export { TransitionManager }
