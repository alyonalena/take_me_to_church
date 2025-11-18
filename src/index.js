import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import reportWebVitals from './reportWebVitals'
import {  ConfigProvider, theme  } from 'antd'

const root = ReactDOM.createRoot(document.getElementById('root'))


root.render(
  <React.StrictMode>
      <ConfigProvider 
          theme={{
            algorithm: theme.darkAlgorithm,
            token: {
              // Primary Colors - Blue palette
              colorPrimary: '#315877',           // Your main color as primary
              colorSuccess: '#52c41a',
              colorWarning: '#faad14',
              colorError: '#ff4d4f',
              colorInfo: '#315877',              // Using main blue for info
              
              // Background Colors - Light theme with blue tones
              colorBgBase: '#ffffff',            // Main background (white)
              colorBgContainer: '#f8f9fa',       // Component background (light gray)
              colorBgElevated: '#ffffff',        // Elevated components
              colorBgLayout: '#f5f7fa',          // Layout background (very light blue-gray)
              colorBgSpotlight: '#315877',       // Tooltip, popover background (your blue)
              
              // Text Colors - Dark text for light background
              colorTextBase: 'rgba(0, 0, 0, 0.85)',
              colorText: '#F0F5FF',
              colorTextSecondary: 'rgba(0, 0, 0, 0.65)',
              colorTextTertiary: 'rgba(0, 0, 0, 0.45)',
              colorTextQuaternary: 'rgba(0, 0, 0, 0.25)',
              
              // Border Colors
              colorBorder: '#d9d9d9',
              colorBorderSecondary: '#f0f0f0',
              
              // Fill Colors
              colorFill: 'rgba(0, 0, 0, 0.15)',
              colorFillSecondary: 'rgba(0, 0, 0, 0.06)',
              colorFillTertiary: 'rgba(0, 0, 0, 0.04)',
              colorFillQuaternary: 'rgba(0, 0, 0, 0.02)',
              
              // Additional Colors
              colorBgMask: 'rgba(0, 0, 0, 0.45)', // Modal mask
              colorLink: '#315877',               // Link color same as primary
              
              // Extended Blue Palette
              colorPrimaryBg: '#1B3041',          // Very light blue for primary backgrounds
              colorPrimaryBgHover: '#d6e4ff',     // Light blue for hover states
              colorPrimaryBorder: '#adc6ff',      // Light blue border
              colorPrimaryBorderHover: '#85a5ff', // Medium blue border hover
              colorPrimaryHover: '#1e3a5c',       // Darker blue for hover
              colorPrimaryActive: '#102a4e',      // Even darker for active states
              colorPrimaryTextHover: '#1e3a5c',   // Text hover
              colorPrimaryText: '#315877',        // Primary text
              colorPrimaryTextActive: '#102a4e',  // Primary text active
              
              // Font
              fontSize: 14,
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
              
              // Border Radius
              borderRadius: 6,
              
              // Size
              sizeStep: 4,
              sizeUnit: 4,
              
              // Control
              controlHeight: 32,
            },
            components: {
              // Button component customization
              Button: {
                colorPrimary: '#1B3041',
                colorPrimaryHover: '#1e3a5c',
                colorPrimaryActive: '#102a4e',
                algorithm: true,
              },
              
              // Input component customization
              Input: {
                colorBgContainer: '#ECECEC',
                colorBorder: '#d9d9d9',
                colorPrimaryHover: '#315877',
                colorPrimary: '#315877',
                algorithm: true,
              },
              
              // Card component customization
              Card: {
                colorBgContainer: '#ffffff',
                colorBorderSecondary: '#f0f0f0',
                boxShadowTertiary: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
                algorithm: true,
              },
              
              // Menu component customization
              Menu: {
                itemColor: 'rgba(0, 0, 0, 0.85)',
                itemHoverColor: '#315877',
                itemSelectedColor: '#315877',
                itemSelectedBg: '#1B3041',
                itemActiveBg: '#1B3041',
                algorithm: true,
              },
              
             
              // Select component customization
          Select: {
                colorBgContainer: '#315877',
                colorBorder: '#d9d9d9',
                optionSelectedBg: 'rgba(49, 88, 119, 0.08)',
                optionActiveBg: 'rgba(49, 88, 119, 0.04)',
                algorithm: true,
              },
              
              // Modal component customization
              Modal: {
                colorBgElevated: '#ECECEC',
                contentBg: '#ECECEC',
                headerBg: '#ECECEC',
                footerBg: '#ECECEC',
                algorithm: true,
              },
              
              // Layout component customization
              Layout: {
                bodyBg: '#f5f7fa',
                headerBg: '#315877',              // Header uses your main blue color
                headerColor: '#ffffff',           // White text on blue header
                siderBg: '#1e3a5c',               // Darker blue for sider
                triggerBg: '#102a4e',             // Even darker for trigger
                algorithm: true,
              },
            },
          }}
      >
          <App />
      </ConfigProvider>
    
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
