export BRANCH_NAME=development
export NPM_COMMAND=develop

export HOST_IP=$(/sbin/ifconfig | grep "inet 192." | awk '{print $2}')
export IS_WATCH=true

# For node
export SSR_PORT=8000
export BROWSER_SYNC_PORT=8001
export BROWSER_SYNC_CONFIG_PORT=8002
export INSPECTOR_PORT=8080
export NODE_DEBUG_PORT=5858

# For go
export API_PORT=5000
export GIN_PORT=5001
