const checker = { backgroundImage: 'conic-gradient(#eee 25%, #fff 0 50%, #eee 0 75%, #fff 0)', backgroundSize: '16px 16px' }

// Original and result side by side (the checkerboard shows transparent areas)
const BeforeAfter = ({ before, after }) => (
  <div className='grid grid-cols-2 gap-3'>
    <figure><figcaption className='text-xs text-gray-500 mb-1'>Original</figcaption>
      <img src={before} alt='Original upload' className='w-full rounded' /></figure>
    <figure><figcaption className='text-xs text-gray-500 mb-1'>Result</figcaption>
      <img src={after} alt='Processed result' style={checker} className='w-full rounded' /></figure>
  </div>
)

export default BeforeAfter
