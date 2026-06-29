<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  import L from 'leaflet';
  import 'leaflet/dist/leaflet.css';
  import 'leaflet.markercluster';
  import 'leaflet.markercluster/dist/MarkerCluster.css';
  import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
  import { prefersReducedMotion } from '../lib/scrolly.js';

  export let activeStep = 0;

  let mapElement;
  let map;
  let markersGroup;
  let cachedData = null;
  let selectedType = "";
  let types = [];
  let sidebarOpen = false;
  let activeItem = null;
  let renderScene = null;

  $: if (renderScene) renderScene(activeStep);

  // Custom marker icons
  const markerIcons = {};

  function getYouTubeThumbnail(url) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11
      ? `https://img.youtube.com/vi/${match[2]}/hqdefault.jpg`
      : null;
  }

  function renderMarkers(data) {
    if (!data || !map || !markersGroup) return;
    markersGroup.clearLayers();

    const bounds = map.getBounds();

    data.forEach((item) => {
      const type = item["ประเภท"];
      const lat = parseFloat(item["lat"]);
      const long = parseFloat(item["long"]);

      if (
        !isNaN(lat) &&
        !isNaN(long) &&
        bounds.contains([lat, long]) &&
        (selectedType === "" || type === selectedType)
      ) {
        const icon = markerIcons[type] || markerIcons["default"];
        const marker = L.marker([lat, long], { icon });

        marker.on("click", () => {
          activeItem = {
            name: item["ชื่อสถานที่"] || item["ชื่อ"],
            type,
            contact: item["ช่องทางการติดต่อ"] || item["ติดต่อ"],
            details: item["รายละเอียดเพิ่มเติม"] || item["รายละเอียด"],
            link: item["ลิงก์เพิ่มเติม"] || item["ลิงก์"],
            thumbnailUrl: getYouTubeThumbnail(item["ลิงก์เพิ่มเติม"] || item["ลิงก์"])
          };
          sidebarOpen = true;
        });

        markersGroup.addLayer(marker);
      }
    });

    map.addLayer(markersGroup);
  }

  function applyFilter() {
    renderMarkers(cachedData);
  }

  onMount(() => {
    if (!mapElement) return;

    // Define icons inside onMount to ensure Leaflet is fully loaded
    const iconConfig = {
      "ค่ายเพลง": "/asset/map-icon/media-producemap-icon.svg",
      "เครื่องดนตรี": "/asset/map-icon/music-instrumentmap-icon.svg",
      "เครื่องเสียง": "/asset/map-icon/speakermap-icon.svg",
      "ศิลปินหมอลำ": "/asset/map-icon/molummap-icon.svg",
      "สถานที่เรียน": "/asset/map-icon/studymap-icon.svg",
      "default": "/asset/map-icon/pinmap-icon.svg"
    };

    Object.keys(iconConfig).forEach((key) => {
      markerIcons[key] = L.icon({
        iconUrl: iconConfig[key],
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36]
      });
    });

    // Initialize map
    map = L.map(mapElement, {
      zoomControl: false
    }).setView([16.1, 103.8], 7.5);

    L.control
      .zoom({
        position: "topright"
      })
      .addTo(map);

    L.tileLayer(
      "https://tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=4a98d80f4fbc47d7a4582e9f9dc26709",
      {
        attribution: "&copy; OpenStreetMap contributors & Thunderforest",
        apikey: "4a98d80f4fbc47d7a4582e9f9dc26709",
        updateWhenIdle: true,
        updateWhenZooming: false,
        keepBuffer: 2
      }
    ).addTo(map);

    markersGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 50
    });

    // Load CSV
    d3.csv("/data/cultural_capital.csv")
      .then((data) => {
        cachedData = data;
        types = [...new Set(data.map((item) => item["ประเภท"]))].filter(Boolean).sort();
        renderMarkers(data);
      })
      .catch((error) => console.error("Error loading cultural capital CSV:", error));

    // Leaflet bounds change handler
    map.on("moveend", () => {
      if (cachedData) renderMarkers(cachedData);
    });

    // --- Scroll-driven scenes -------------------------------------------------
    // 0: all capital, Isan overview · 1: spotlight หมอลำ artists, fly closer · 2: zoom out, invite exploration
    const SCENES = [
      { type: "", center: [16.1, 103.8], zoom: 7.5 },
      { type: "หมอลำ", center: [15.8, 103.4], zoom: 8 },
      { type: "", center: [16.2, 103.2], zoom: 6.8 }
    ];

    renderScene = function (step) {
      const scene = SCENES[Math.max(0, Math.min(step, SCENES.length - 1))];
      selectedType = scene.type;
      const animate = !prefersReducedMotion();
      map.flyTo(scene.center, scene.zoom, { animate, duration: 1.1 });
      if (cachedData) renderMarkers(cachedData);
    };

    return () => {
      if (map) map.remove();
    };
  });
</script>

<div id="cultural-map-container" style="position: relative; width: 100%; height: 100%; margin: 0;">
  <div bind:this={mapElement} id="cultural-map" style="width: 100%; height: 100%; z-index: 1;"></div>
  
  <!-- Filter dropdown -->
  <div id="cultural-map-filter" style="position: absolute; top: 20px; left: 20px; z-index: 10; background: rgba(18, 14, 40, 0.85); backdrop-filter: blur(8px); padding: 12px 18px; border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3); display: flex; align-items: center; gap: 8px;">
    <label for="cultural-type-filter" style="font-family: var(--font-display); font-size: 0.9rem; color: var(--text-primary); font-weight: 600;">เลือกประเภท:</label>
    <select 
      id="cultural-type-filter" 
      bind:value={selectedType}
      style="background: rgba(7, 5, 16, 0.8); border: 1px solid rgba(255, 255, 255, 0.15); color: #fff; padding: 6px 12px; border-radius: 10px; font-family: var(--font-body); font-size: 0.85rem; outline: none;"
    >
      <option value="">ทั้งหมด</option>
      {#each types as type}
        <option value={type}>{type}</option>
      {/each}
    </select>
    <button 
      id="cultural-apply-filter" 
      class="playButton" 
      on:click={applyFilter}
      style="padding: 6px 16px; font-size: 0.8rem; margin: 0;" 
      type="button"
    >
      กรองข้อมูล
    </button>
  </div>

  <!-- Sidebar -->
  <div 
    id="cultural-sidebar" 
    class="sidebar" 
    style="position: absolute; top: 0; right: {sidebarOpen ? '0px' : '-320px'}; width: 300px; height: 100%; background: rgba(18, 14, 40, 0.95); backdrop-filter: blur(12px); border-left: 1px solid rgba(255, 255, 255, 0.1); box-shadow: -10px 0 30px rgba(0, 0, 0, 0.5); z-index: 20; transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1); padding: 25px; box-sizing: border-box; overflow-y: auto; color: var(--text-primary);"
  >
    <button 
      id="close-cultural-sidebar" 
      on:click={() => sidebarOpen = false}
      style="position: absolute; top: 15px; right: 20px; background: none; border: none; color: var(--text-secondary); font-size: 24px; cursor: pointer; transition: color 0.3s;" 
      type="button"
    >
      &times;
    </button>
    
    <div id="cultural-sidebar-content" style="margin-top: 20px;">
      {#if activeItem}
        <h2>{activeItem.name}</h2>
        <p><strong>ประเภท:</strong> <span style="color: var(--neon-cyan); font-weight: 600;">{activeItem.type}</span></p>
        <p><strong>ช่องทางติดต่อ:</strong> {activeItem.contact || "ไม่มีข้อมูลติดต่อ"}</p>
        <p><strong>รายละเอียด:</strong> {activeItem.details || "-"}</p>
        
        {#if activeItem.thumbnailUrl}
          <p><strong>วิดีโอแนะนำ:</strong></p>
          <a href={activeItem.link} target="_blank" rel="noreferrer" class="thumbnail-wrapper">
            <img src={activeItem.thumbnailUrl} alt="YouTube Thumbnail">
            <div class="play-button"></div>
          </a>
        {:else}
          {#if activeItem.link}
            <p><strong>ข้อมูลเพิ่มเติม:</strong> <a href={activeItem.link} target="_blank" rel="noreferrer" style="color: var(--neon-cyan)">คลิกเพื่อดูข้อมูล</a></p>
          {/if}
        {/if}
      {/if}
    </div>
  </div>
</div>
