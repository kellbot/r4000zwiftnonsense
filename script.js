 let totalDropsNeeded = 10000000;
       
fetch('bikedata.json')
    .then(response => response.json())
    .then(data => {

        let totalDistanceNeeded = 0;
        let completedDistance = 0;
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
        document.getElementById('totalDropsNeeded').textContent = totalDropsNeeded.toLocaleString();
        document.getElementById('completedDrops').textContent = completedDrops.toLocaleString();
        document.getElementById('remainingDrops').textContent = (totalDropsNeeded - completedDrops).toLocaleString();
        document.getElementById('totalDistanceNeeded').textContent = totalDistanceNeeded.toLocaleString();
        document.getElementById('completedDistance').textContent = completedDistance.toLocaleString();
        document.getElementById('remainingDistance').textContent = remainingDistance.toLocaleString();
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
        
        // Populate activities panel
        populateActivities(data.activities);
        
        console.log('Total distance needed:', totalDistanceNeeded);
        console.log('Completed distance:', completedDistance);
        console.log('Progress:', progressPercentage + '%');
    })
    .catch(error => console.error('Error loading bike data:', error));

// Function to convert h:mm:ss duration to fractional hours
function durationToHours(duration) {
    const parts = duration.split(':');
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parseInt(parts[2], 10);
    
    return hours + (minutes / 60) + (seconds / 3600);
}

// Function to populate activities
function populateActivities(activities) {
    const startingDrops = 609654;
    let totalDuration = 0;
    const activitiesContent = document.getElementById('activitiesContent');
    
    if (!activities || activities.length === 0) {
        activitiesContent.innerHTML = '<p class="loading">No activities found.</p>';
        return;
    }
    
    // Sort activities by timestamp (oldest first)
    const sortedActivities = [...activities].sort((a, b) => 
        new Date(a.timestamp) - new Date(b.timestamp)
    );


    let activityListHTML = '';

    // Add individual activities
    let currentDrops = startingDrops;
    sortedActivities.forEach(activity => {
        const date = new Date(activity.timestamp);
        const formattedDate = date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        activity.drops_earned = activity.drop_total - currentDrops;
        activity.durationHours = durationToHours(activity.duration);
        totalDuration += activity.durationHours;

        activityListHTML += `
            <div class="activity-item">
                <div class="activity-date">${formattedDate}</div>
                <div class="activity-details">
                    <span>Duration: <strong>${activity.duration}</strong></span>
                    <span>Drops: <strong>${(activity.drops_earned).toLocaleString()}</strong></span>
                </div>
            </div>
        `;
        currentDrops = activity.drop_total;
    });

        // Calculate average drops per hour
    const completedDrops = sortedActivities[sortedActivities.length - 1].drop_total;
    const totalDropsEarned = completedDrops - startingDrops;
    const averageDropsPerHour = totalDuration > 0 ? totalDropsEarned / totalDuration : 0;
    
    // Create summary box
    let activitiesHTML = `
        <div class="activity-summary-box">
            <h3>Average Performance</h3>
            <div class="summary-stat">
                <span class="summary-label">Drops per Hour:</span>
                <span class="summary-value">${Math.round(averageDropsPerHour).toLocaleString()}</span>
            </div>
            <div class="summary-details">
                <span>Total Drops: ${totalDropsEarned.toLocaleString()}</span>
                <span>Total Hours: ${totalDuration.toFixed(2)}</span>
            </div>
        </div>
    ` + activityListHTML;
    
    console.log('Total activity duration (hours):', totalDuration.toFixed(2));
    console.log('Average drops per hour:', Math.round(averageDropsPerHour).toLocaleString());
    console.log('Total drops needed:', totalDropsNeeded);
    let remainingHours = (totalDropsNeeded - completedDrops) / averageDropsPerHour;
    
    let hoursPerWeek = 3;
    let estimatedWeeks = remainingHours / hoursPerWeek;

    let estimatedCompletionDate = new Date();
    estimatedCompletionDate.setDate(estimatedCompletionDate.getDate() + estimatedWeeks * 7);
    console.log('Estimated Completion Date:', estimatedCompletionDate);

    document.getElementById('estimatedCompletionDate').textContent = estimatedCompletionDate.toLocaleDateString();
    activitiesContent.innerHTML = activitiesHTML;
}

// Toggle panel functionality
const toggleBtn = document.getElementById('togglePanelBtn');
const closeBtn = document.getElementById('closePanelBtn');
const panel = document.getElementById('activitiesPanel');

function togglePanel() {
    panel.classList.toggle('open');
    toggleBtn.classList.toggle('panel-open');
}

toggleBtn.addEventListener('click', togglePanel);
closeBtn.addEventListener('click', togglePanel);

// Close panel when clicking outside
document.addEventListener('click', (e) => {
    if (panel.classList.contains('open') && 
        !panel.contains(e.target) && 
        !toggleBtn.contains(e.target)) {
        togglePanel();
    }
});
