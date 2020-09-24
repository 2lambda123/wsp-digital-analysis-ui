import {Coords, DoneCallback, GridLayer as LeafletGridLayer} from 'leaflet'
import {GridLayer, GridLayerProps, withLeaflet} from 'react-leaflet'

type DrawTileFn = (
  canvas: HTMLCanvasElement,
  coords: Coords,
  z: number
) => HTMLElement

class MutableGridLayer extends LeafletGridLayer {
  drawTile: DrawTileFn

  constructor(options) {
    super(options)
    this.drawTile = options.drawTile
  }

  createTile(coords: Coords, _: DoneCallback) {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 256
    this.drawTile(canvas, coords, coords.z)
    return canvas
  }
}

interface GridualizerLayerProps extends GridLayerProps {
  drawTile: DrawTileFn
}

class GridualizerLayer extends GridLayer<
  GridualizerLayerProps,
  MutableGridLayer
> {
  createLeafletElement(props: GridualizerLayerProps) {
    return new MutableGridLayer({drawTile: props.drawTile})
  }
}

export default withLeaflet(GridualizerLayer)
