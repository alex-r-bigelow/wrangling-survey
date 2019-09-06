/* globals d3 */
import SurveyView from '../SurveyView/SurveyView.js';

class SpatialView extends SurveyView {
  constructor (div, transform) {
    super(div, [
      { type: 'text', url: 'views/SpatialView/1DPoints.svg' },
      { type: 'text', url: 'views/SpatialView/1DVectors.svg' },
      { type: 'text', url: 'views/SpatialView/1DTensors.svg' },
      { type: 'text', url: 'views/SpatialView/1DIntervals.svg' },
      { type: 'text', url: 'views/SpatialView/2DPoints.svg' },
      { type: 'text', url: 'views/SpatialView/2DVectors.svg' },
      { type: 'text', url: 'views/SpatialView/2DTensors.svg' },
      { type: 'text', url: 'views/SpatialView/2DAreas.svg' },
      { type: 'text', url: 'views/SpatialView/2DLines.svg' },
      { type: 'text', url: 'views/SpatialView/3DPoints.svg' },
      { type: 'text', url: 'views/SpatialView/3DVectors.svg' },
      { type: 'text', url: 'views/SpatialView/3DTensors.svg' },
      { type: 'text', url: 'views/SpatialView/3DLines.svg' },
      { type: 'text', url: 'views/SpatialView/3DSurfaces.svg' },
      { type: 'text', url: 'views/SpatialView/3DVolumes.svg' },
      { type: 'less', url: 'views/SpatialView/style.less' },
      { type: 'text', url: 'views/SpatialView/template.html' }
    ]);
    this.previewLookup = {
      'temporal': {
        '1': { 'Points': 0, 'Intervals': 3 },
        '2': { 'Points': 0, 'Vectors': 1, 'Tensors': 2, 'Intervals': 3 },
        '3': { 'Points': 4, 'Vectors': 5, 'Tensors': 6, 'Areas': 7, 'Lines': 8 },
        '4+': { 'Points': 9, 'Vectors': 10, 'Tensors': 11, 'Lines': 12, 'Surfaces': 13, 'Volumes': 14 }
      },
      'spatialOnly': {
        '1': { 'Points': 0, 'Vectors': 1, 'Tensors': 2, 'Intervals': 3 },
        '2': { 'Points': 4, 'Vectors': 5, 'Tensors': 6, 'Areas': 7, 'Lines': 8 },
        '3': { 'Points': 9, 'Vectors': 10, 'Tensors': 11, 'Lines': 12, 'Surfaces': 13, 'Volumes': 14 },
        '4+': { 'Points': 9, 'Vectors': 10, 'Tensors': 11, 'Lines': 12, 'Surfaces': 13, 'Volumes': 14, 'Hypervolumes': 14 }
      }
    };
    this.state = transform ? 'post' : 'init';
    this.humanLabel = 'Spatial / Temporal Data Details';
  }
  get dimensions () {
    return {
      temporal: this.d3el.select(`#${this.state}isTemporal`).node().checked ? 'temporal' : 'spatialOnly',
      spaceDimensions: this.d3el.selectAll(`[data-key="${this.state}NDimensions"]`)
        .nodes().filter(element => element.checked)[0].dataset.checkedValue,
      itemType: this.d3el.selectAll(`[data-key="${this.state}SpatialItemType"]`)
        .nodes().filter(element => element.checked)[0].dataset.checkedValue
    };
  }
  setup () {
    const state = this.state; // eslint-disable-line no-unused-vars
    this.d3el.html(eval('`' + this.resources[16] + '`')); // eslint-disable-line no-eval
    super.collectKeyElements();
    const checkItemType = () => {
      const { temporal, spaceDimensions, itemType } = this.dimensions;
      if (this.previewLookup[temporal][spaceDimensions][itemType] === undefined) {
        this.d3el.select(`[data-checked-value="Points"]`).property('checked', true);
      }
    };
    this.d3el.selectAll(`[data-key="${this.state}NDimensions"]`)
      .on('click', checkItemType) // browser are weird about radio buttons... so we need the click event too
      .on('change', checkItemType);
    this.d3el.selectAll(`#${this.state}isTemporal`)
      .on('click', checkItemType);
  }
  draw () {
    const { temporal, spaceDimensions, itemType } = this.dimensions;
    const eligibleTypes = this.previewLookup[temporal][spaceDimensions];
    const preview = this.resources[eligibleTypes[itemType]];

    this.d3el.select('.preview').html(preview);
    this.d3el.selectAll(`[data-key="${this.state}SpatialItemType"]`)
      .each(function () {
        const eligible = eligibleTypes[this.dataset.checkedValue] !== undefined;
        d3.select(this.parentNode).style('display', eligible ? null : 'none');
      });
  }
  isEnabled (formValues) {
    return this.state === 'init' && formValues.datasetType === 'Spatial';
  }
  validateForm (formValues) {
    const temporal = formValues[`${this.state}isTemporal`] ? 'temporal' : 'spatialOnly';
    const eligibleTypes = this.previewLookup[temporal][formValues[`${this.state}NDimensions`]];
    if (eligibleTypes[formValues[`${this.state}SpatialItemType`]] === undefined) {
      formValues[`${this.state}SpatialItemType`] = 'Points';
    }
    return {
      isValid: true,
      invalidIds: {}
    };
  }
}
export default SpatialView;
