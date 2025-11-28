import React from 'react';
import './FilterBar.scss';

const FilterBar = ({ continents, activeFilter, onFilterChange }) => {
    return (
        <div className="filter-bar">
            <div className="container filter-container">
                <button
                    className={`filter-button ${activeFilter === 'All' ? 'active' : ''}`}
                    onClick={() => onFilterChange('All')}
                >
                    Tous
                </button>
                {continents.map((continent) => (
                    <button
                        key={continent}
                        className={`filter-button ${activeFilter === continent ? 'active' : ''}`}
                        onClick={() => onFilterChange(continent)}
                    >
                        {continent}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default FilterBar;
