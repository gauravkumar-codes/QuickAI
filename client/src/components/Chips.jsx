// Pick-one chips. Real buttons, so they work with the keyboard and screen readers.
const Chips = ({ items, value, onChange, active, label }) => (
  <div role='radiogroup' aria-label={label} className='mt-3 flex gap-3 flex-wrap sm:max-w-9/11'>
    {items.map((i) => (
      <button type='button' role='radio' aria-checked={value === i} key={i} onClick={() => onChange(i)}
        className={`text-xs px-4 py-1 border rounded-full cursor-pointer ${value === i ? active : 'text-gray-500 border-gray-300'}`}>{i}</button>
    ))}
  </div>
)

export default Chips
