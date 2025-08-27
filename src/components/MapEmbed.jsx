import React from "react";
import { Box, Button } from "@mui/material";

const lat = 10.847987;
const lng = 106.7860196;
const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

export default function MapEmbed() {
  return (
    <Box sx={{ width: "100%", mt: 3 }}>
      {/* Nhúng iframe từ Google Maps */}
      <iframe
        title="Our Cafe Location"
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d800.317480799819!2d106.78654672875!3d10.847557854060973!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752772b245dff1%3A0xb838977f3d419d!2zSOG7jWMgdmnhu4duIEPDtG5nIG5naOG7hyBCxrB1IENow61uaCBWaeG7hW4gVGjDtG5nIGPGoSBz4bufIHThuqFpIFRQLkhDTQ!5e0!3m2!1svi!2s!4v1756274875739!5m2!1svi!2s"
        style={{
          border: 0,
          width: "100%",
          height: "360px",
          borderRadius: "12px",
        }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />

      {/* Nút chỉ đường */}
      <Box sx={{ mt: 2, textAlign: "center" }}>
        <Button
          variant="contained"
          color="primary"
          href={directionsUrl}
          target="_blank"
          rel="noreferrer"
        >
          Get Directions
        </Button>
      </Box>
    </Box>
  );
}