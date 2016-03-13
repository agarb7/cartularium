# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure(2) do |config|
  config.vm.box = "debian/jessie64"

  config.vm.network "private_network", ip: "192.168.33.20"
  config.vm.hostname = "cartularium.dev"

  unless Vagrant.has_plugin?("vagrant-hostsupdater")
    puts 'vagrant-hostsupdater is not installed!'
    puts 'To install the plugin, run:'
    puts 'vagrant plugin install vagrant-hostsupdater'
    exit
  end

  config.vm.synced_folder ".", "/vagrant", type: "virtualbox"

  config.vm.provision :shell, path: "vagrant/bootstrap.sh"
end
