fetch('bikedata.json')
    .then(response => response.json())
    .then(data => {
        let startingDrops = 629654;
        let totalDistanceNeeded = 0;
        let completedDistance = 0;
        let totalDropsNeeded = 10000000;
        let completedDrops = data.activities.at(-1).drop_total;
        const bikeProgressBarsContainer = document.getElementById('bikeProgressBars');
        
        // Loop through all bikes
        data.bikes.forEach(bike => {
            let bikeDistanceNeeded = 0;
            let bikeCompletedDistance = 0;
            
            // Loop through all levels in each bike
            bike.levels.forEach(level => {
                // Sum distance_needed where purchased is false
                if (level.purchased === false && level.distance_needed) {
                    bikeDistanceNeeded += level.distance_needed;
                    bikeCompletedDistance += level.distance_completed || 0;
                    
                    totalDistanceNeeded += level.distance_needed;
                    completedDistance += level.distance_completed || 0;

                    totalDropsNeeded += level.price || 0;
                }
            });
            
            // Calculate progress for this bike
            const bikeProgressPercentage = bikeDistanceNeeded > 0 
                ? Math.round((bikeCompletedDistance / bikeDistanceNeeded) * 100) 
                : 0;
            
            // Create progress bar for this bike
            const bikeProgressHTML = `
                <div class="bike-progress-item">
                    <div class="bike-header">
                        <div class="bike-name">${bike.name}</div>
                        <div class="bike-stats">
                            <span>${bikeCompletedDistance}</span> / ${bikeDistanceNeeded} km
                        </div>
                    </div>
                    <div class="progress-bar-container">
                        <div class="progress-bar bike-progress-bar" data-progress="${bikeProgressPercentage}">
                            <span class="progress-text">${bikeProgressPercentage}%</span>
                        </div>
                    </div>
                </div>
            `;
            
            bikeProgressBarsContainer.innerHTML += bikeProgressHTML;
        });
        
        const remainingDistance = totalDistanceNeeded - completedDistance;
        const progressPercentage = totalDistanceNeeded > 0 
            ? Math.round((completedDistance / totalDistanceNeeded) * 100) 
            : 0;
        
        // Update the overall display
        document.getElementById('totalDropsNeeded').textContent = totalDropsNeeded;
        document.getElementById('completedDrops').textContent = completedDrops;
        document.getElementById('remainingDrops').textContent = totalDropsNeeded - completedDrops;
        document.getElementById('totalDistanceNeeded').textContent = totalDistanceNeeded;
        document.getElementById('completedDistance').textContent = completedDistance;
        document.getElementById('remainingDistance').textContent = remainingDistance;
        document.getElementById('progressText').textContent = `${progressPercentage}%`;
        
        // Animate all progress bars
        setTimeout(() => {
            document.getElementById('progressBar').style.width = `${progressPercentage}%`;
            
            // Animate bike progress bars
            document.querySelectorAll('.bike-progress-bar').forEach(bar => {
                const progress = bar.getAttribute('data-progress');
                bar.style.width = `${progress}%`;
            });
        }, 100);
        
        console.log('Total distance needed:', totalDistanceNeeded);
        console.log('Completed distance:', completedDistance);
        console.log('Progress:', progressPercentage + '%');
    })
    .catch(error => console.error('Error loading bike data:', error));
