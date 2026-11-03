#!/usr/bin/env python

import subprocess
import re
import socket
import ctypes
import os

__author__ = "Jacob Dubs"
__email__ = "jacob.dubs@gentex.com"
__version__ = "1.0.0"

def run_powershell_cmd(cmd):
    '''Runs a command in powershell and returns a result object.'''
    response = subprocess.run(['powershell', '-Command', cmd], text=True, capture_output=True)

    if response.returncode != 0:
        print(f'An error ocurred: {response.stderr}')

    return response

def check_admin_privileges():
    '''Checks for admin privileges for this script.'''
    is_admin = False

    try:
        is_admin = os.getuid() == 0
    except AttributeError:
        is_admin = ctypes.windll.shell32.IsUserAnAdmin() != 0

    print(f'IS ADMIN: {is_admin}')
    return is_admin

def get_wsl_ip_address():
    '''Returns the internal ip address of WSL instance.'''
    response = run_powershell_cmd('wsl -- ip -o -4 -json addr list eth0 | ConvertFrom-Json | %{ $_.addr_info.local } | ?{ $_ }')

    if response.returncode == 0:
        wsl_ip = response.stdout
        print(f'WSL IP Address --> {wsl_ip}')
        return wsl_ip
    else:
        print(f'An error ocurred: {response.stderr}')
    
def get_host_ip_address():
    '''Returns the ip address of the host machine.'''
    hostname = socket.gethostname()
    ipaddr = socket.gethostbyname(hostname)
    print(f'Host IP Address --> {ipaddr}')
    return ipaddr

def get_host_ip_address_via_commandline():
    '''Returns the ip address of the host machine using the command line.'''
    response = run_powershell_cmd('ipconfig')
    lines = response.stdout.split('\n')
    ipOut = ""
    takeNext = False
    for line in lines:
        line = line.strip()
        if (line.startswith("Ethernet adapter Ethernet:")):
            takeNext = True

        if (takeNext and line.startswith("IPv4 Address")):
            ipaddr = line.split(':')[1]
            print(f'Host IP Address --> {ipaddr}')
            return ipaddr
            
    return get_host_ip_address()

def remove_rule(listen_address, listen_port, forward_address, forward_port):
    '''Removes a port forwarding rule with the given addresses and ports'''
    print(f'REMOVING RULE({listen_address}:{listen_port} --> {forward_address}:{forward_port})')
    run_powershell_cmd(f'netsh interface portproxy delete v4tov4 listenport={listen_port} listenaddress={listen_address}')

def add_pf_rule(listen_address, listen_port, forward_address, forward_port):
    '''Adds a port forwarding rule for the given addresses and ports.'''
    print(f'ADDING PF RULE({listen_address}:{listen_port} --> {forward_address}:{forward_port})')
    run_powershell_cmd(f'netsh interface portproxy add v4tov4 listenport={listen_port} listenaddress={listen_address} connectport={forward_port} connectaddress={forward_address}')

def add_firewall_exceptions(display_name, port):
    '''Adds a Windows firewall exception for the given port.'''
    # Inbound
    print(f'Adding Inbound Exception For Port --> {port}')
    run_powershell_cmd(f"New-NetFireWallRule -DisplayName '{display_name}' -Direction Inbound -LocalPort {port} -Action Allow -Protocol TCP")

    # Outbound
    print(f'Adding Outbound Exception For Port --> {port}')
    run_powershell_cmd(f"New-NetFireWallRule -DisplayName '{display_name}' -Direction Outbound -LocalPort {port} -Action Allow -Protocol TCP")

def delete_old_rules():
    '''Removes the old port forwarding rules on the host.'''
    show_all_cmd = 'netsh interface portproxy show all'
    response = run_powershell_cmd(show_all_cmd)
    output_lines = response.stdout.split('\n')
    match_count = 0

    rule_re = re.compile(r'^(\d+\.\d+\.\d+\.\d+)\s+(\d+)\s+(\d+\.\d+\.\d+\.\d+)\s+(\d+)$')
    for line in output_lines:
        match = re.match(rule_re, line)
        if match:
            remove_rule(match[1], match[2], match[3], match[4])
            match_count += 1

    print(f'Removed {match_count} rules.')


def add_server_forwarding(host_ip, wsl_ip):
    '''Adds port forwarding rules for the dev server.'''
    add_pf_rule(host_ip, 3000, wsl_ip, 3000)
    add_pf_rule(host_ip, 3001, wsl_ip, 3001)

def add_websocket_forwarding(host_ip, wsl_ip):
    '''Adds a port forwarding rule for the Web Socket.'''
    add_pf_rule(host_ip, 4000, wsl_ip, 4000)

def add_redis_forwarding(host_ip, wsl_ip):
    '''Adds a port forwarding rule for Redis.'''
    add_pf_rule(host_ip, 6379, wsl_ip, 6379)

def add_database_forwarding(host_ip, wsl_ip):
    '''Adds a port forwarding rule for the database.'''
    add_pf_rule(host_ip, 1433, wsl_ip, 1433)

def add_ssh_forwarding(host_ip, wsl_ip):
    '''Adds a port forwarding rule for ssh.'''
    add_pf_rule(host_ip, 22, wsl_ip, 22)



if __name__ == '__main__':
    if not check_admin_privileges():
        print('This script must be ran with admin privileges.')
        exit()

    # Remove Port Forwarding
    delete_old_rules()

    # Get Ip Addresses
    host_ip = get_host_ip_address_via_commandline().strip()
    wsl_ip = get_wsl_ip_address().strip()

    # New Port Forwarding
    add_server_forwarding(host_ip, wsl_ip)
    add_websocket_forwarding(host_ip, wsl_ip)
    add_redis_forwarding(host_ip, wsl_ip)
    add_database_forwarding(host_ip, wsl_ip)
    add_ssh_forwarding(host_ip, wsl_ip)

    # Firewall Exceptions
    add_firewall_exceptions('WSL 2 Dev Server 3000 Firewall Unlock', 3000)
    add_firewall_exceptions('WSL 2 Dev Server 3001 Firewall Unlock', 3001)
    add_firewall_exceptions('WSL 2 Web Socket 4000 Firewall Unlock', 4000)
    add_firewall_exceptions('WSL 2 DB Firewall Unlock', 1433)
    add_firewall_exceptions('WSL 2 Redis Firewall Unlock', 6379)
    add_firewall_exceptions('WSL 2 SSH', 22)
