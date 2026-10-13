// A labelled row of filter chips. The first chip clears the filter.
export default function ChipGroup({ label, options, value, onChange, allLabel = 'All', format = String }) {
  const isActive = (option) => String(option).toLowerCase() === String(value).toLowerCase();

  return (
    <div className="filter-row">
      <p className="filter-row__label">{label}</p>
      <div className="chips" role="group" aria-label={label}>
        <button
          type="button"
          className={`chip ${!value ? 'is-active' : ''}`}
          aria-pressed={!value}
          onClick={() => onChange('')}
        >
          {allLabel}
        </button>
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className={`chip ${isActive(option) ? 'is-active' : ''}`}
            aria-pressed={isActive(option)}
            onClick={() => onChange(String(option))}
          >
            {format(option)}
          </button>
        ))}
      </div>
    </div>
  );
}
