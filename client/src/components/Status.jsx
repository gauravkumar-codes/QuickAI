// Loading, error or empty message for a list. Renders nothing when there is data.
const Status = ({ loading, slow, err, empty, emptyText, onRetry }) => {
  if (loading) return <p className='text-sm text-gray-500'>Loading{slow ? '... the server may be waking up, this can take up to a minute.' : '...'}</p>
  if (err) return (
    <p role='alert' className='text-sm text-red-500'>{err}{' '}
      {onRetry && <button type='button' onClick={onRetry} className='underline cursor-pointer'>Try again</button>}
    </p>
  )
  if (empty) return <p className='text-sm text-gray-500'>{emptyText}</p>
  return null
}

export default Status
